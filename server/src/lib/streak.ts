import { prisma } from '../db.js'

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** 連續打卡天數：抓「每日任務完成」「運動紀錄」「多益每日打卡」這三種有實際日期的
 * 活動，算出有紀錄的不重複日期集合，再從今天（今天還沒有紀錄就從昨天）往回數連續
 * 天數。全新帳號沒有任何紀錄就是 0 天，不是寫死的示意數字。 */
export async function getStreakDays(userId: string): Promise<number> {
  const [dailyTasks, sportLogs, toeicProgress] = await Promise.all([
    prisma.dailyTask.findMany({ where: { userId, completedAt: { not: null } }, select: { completedAt: true } }),
    prisma.sportLog.findMany({ where: { userId }, select: { loggedAt: true } }),
    prisma.toeicProgress.findMany({ where: { userId }, select: { date: true } }),
  ])

  const activeDates = new Set<string>()
  for (const t of dailyTasks) if (t.completedAt) activeDates.add(toDateKey(t.completedAt))
  for (const s of sportLogs) activeDates.add(toDateKey(s.loggedAt))
  for (const p of toeicProgress) activeDates.add(toDateKey(p.date))

  let streak = 0
  const cursor = new Date()
  if (!activeDates.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (activeDates.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
