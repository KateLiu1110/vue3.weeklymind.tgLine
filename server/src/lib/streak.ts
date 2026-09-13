import { prisma } from '../db.js'

// 全站排程／時區慣例都是 Asia/Taipei（見 server/.env 的 DAILY_CHECKIN_TIMEZONE），但
// 伺服器本身常常是跑在 UTC 環境（Railway/本機 Docker 皆是）。原本這裡直接用
// toISOString() 取日期字串，等於用 UTC 當「今天」的分界——台北時間每天 00:00–08:00
// 這段（UTC 還停在前一天）打卡，會被算成前一天的紀錄，連續打卡天數跟這裡的「本週
// 達成率變化」都會因此少算或算錯天。改用 Intl.DateTimeFormat 明確指定時區，不受
// 伺服器自己的系統時區影響。
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function toDateKey(d: Date): string {
  return DATE_KEY_FORMATTER.format(d)
}

/** 抓「每日任務完成」「運動紀錄」「多益每日打卡」這三種有實際日期的活動，回傳
 * 每個日期（YYYY-MM-DD）有幾筆紀錄。連續打卡天數（getStreakDays）跟覆盤中心的
 * 「本週達成率變化」（見 routes/retro.ts 的 /summary）都是從同一份資料算出來的，
 * 確保「這幾天有沒有打卡」在全站看到的都是同一個答案，不是兩份各自的示意數字。
 * since 省略時回傳所有歷史紀錄（給連續打卡天數用，需要往回無限找）。 */
export async function getDailyActivityCounts(userId: string, since?: Date): Promise<Map<string, number>> {
  const [dailyTasks, sportLogs, toeicProgress] = await Promise.all([
    prisma.dailyTask.findMany({
      where: { userId, completedAt: since ? { gte: since } : { not: null } },
      select: { completedAt: true },
    }),
    prisma.sportLog.findMany({ where: { userId, loggedAt: since ? { gte: since } : undefined }, select: { loggedAt: true } }),
    prisma.toeicProgress.findMany({ where: { userId, date: since ? { gte: since } : undefined }, select: { date: true } }),
  ])

  const counts = new Map<string, number>()
  const bump = (d: Date) => counts.set(toDateKey(d), (counts.get(toDateKey(d)) ?? 0) + 1)
  for (const t of dailyTasks) if (t.completedAt) bump(t.completedAt)
  for (const s of sportLogs) bump(s.loggedAt)
  for (const p of toeicProgress) bump(p.date)
  return counts
}

/** 連續打卡天數：從今天（今天還沒有紀錄就從昨天）往回數連續天數。全新帳號沒有任何
 * 紀錄就是 0 天，不是寫死的示意數字。 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export async function getStreakDays(userId: string): Promise<number> {
  const activeDates = new Set((await getDailyActivityCounts(userId)).keys())

  // 用 setTime 減整數天的毫秒數，不用 setDate/getDate——後者是照伺服器自己的系統
  // 時區在算「前一天」，跟 toDateKey 現在固定用 Asia/Taipei 對不上會兩邊誤差一天。
  // 台灣不實施日光節約時間，UTC+8 全年固定，減 24 小時等於減一個台北日曆天，這裡
  // 用時間戳直接減完全安全。
  let streak = 0
  const cursor = new Date()
  if (!activeDates.has(toDateKey(cursor))) cursor.setTime(cursor.getTime() - ONE_DAY_MS)
  while (activeDates.has(toDateKey(cursor))) {
    streak += 1
    cursor.setTime(cursor.getTime() - ONE_DAY_MS)
  }
  return streak
}
