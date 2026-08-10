import { prisma } from '../db.js'
import { pushMessages, textMessage } from '../services/line.js'

// 解鎖條件（沒有指定明確門檻時的合理預設，之後要調整只要改這個檔案）：
//   連結收藏：新增第一個計畫（代表已經開始用 WeeklyMind 管理目標）
//   覆盤中心：累積打卡次數達到 5 次（要有足夠的打卡紀錄才有東西可以回顧）
//   主題色彩：累積打卡次數達到 15 次（沒有真的金流／訂閱機制，這裡沿用跟其他工具
//   一樣「用得夠久就解鎖」的邏輯，取代原本設想的「付費 Pro」門檻）
export const ACHIEVEMENT_KEYS = {
  links: 'links_unlocked',
  retro: 'retro_unlocked',
  theme: 'theme_unlocked',
} as const

export const ACHIEVEMENT_LABELS: Record<string, string> = {
  [ACHIEVEMENT_KEYS.links]: '連結收藏',
  [ACHIEVEMENT_KEYS.retro]: '覆盤中心',
  [ACHIEVEMENT_KEYS.theme]: '主題色彩',
}

const RETRO_CHECKIN_THRESHOLD = 5
const THEME_CHECKIN_THRESHOLD = 15

async function isUnlocked(userId: string, key: string): Promise<boolean> {
  const existing = await prisma.achievement.findUnique({ where: { userId_key: { userId, key } } })
  return !!existing
}

async function unlock(userId: string, key: string) {
  await prisma.achievement.upsert({
    where: { userId_key: { userId, key } },
    update: {},
    create: { userId, key },
  })
}

/** 累積打卡次數：網頁「今日打卡」跟 LINE Bot 打卡（運動/多益/學習紀錄）都算，
 * 覆盤中心跟主題色彩兩個解鎖條件共用同一套計算方式，只是門檻不同。 */
async function getTotalCheckins(userId: string): Promise<number> {
  const [planCheckins, sportLogs, toeicDays, dailyTasks] = await Promise.all([
    prisma.plan.aggregate({ where: { userId }, _sum: { checkinsDone: true } }),
    prisma.sportLog.count({ where: { userId } }),
    prisma.toeicProgress.count({ where: { userId } }),
    prisma.dailyTask.count({ where: { userId } }),
  ])
  return (planCheckins._sum.checkinsDone ?? 0) + sportLogs + toeicDays + dailyTasks
}

/** 在任何可能改變解鎖條件的動作之後呼叫（新增計畫、打卡）；已解鎖的不會重複判斷。
 * 回傳這次「新」解鎖的 key 清單（沒有新解鎖就是空陣列），呼叫端可以用這個決定要不要
 * 通知使用者，見 notifyUnlocks()。 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const [linksUnlocked, retroUnlocked, themeUnlocked] = await Promise.all([
    isUnlocked(userId, ACHIEVEMENT_KEYS.links),
    isUnlocked(userId, ACHIEVEMENT_KEYS.retro),
    isUnlocked(userId, ACHIEVEMENT_KEYS.theme),
  ])

  const newlyUnlocked: string[] = []
  const tasks: Promise<unknown>[] = []

  if (!linksUnlocked) {
    tasks.push(
      prisma.plan.count({ where: { userId } }).then(async (count) => {
        if (count >= 1) {
          await unlock(userId, ACHIEVEMENT_KEYS.links)
          newlyUnlocked.push(ACHIEVEMENT_KEYS.links)
        }
      }),
    )
  }

  if (!retroUnlocked || !themeUnlocked) {
    tasks.push(
      getTotalCheckins(userId).then(async (total) => {
        if (!retroUnlocked && total >= RETRO_CHECKIN_THRESHOLD) {
          await unlock(userId, ACHIEVEMENT_KEYS.retro)
          newlyUnlocked.push(ACHIEVEMENT_KEYS.retro)
        }
        if (!themeUnlocked && total >= THEME_CHECKIN_THRESHOLD) {
          await unlock(userId, ACHIEVEMENT_KEYS.theme)
          newlyUnlocked.push(ACHIEVEMENT_KEYS.theme)
        }
      }),
    )
  }

  await Promise.all(tasks)
  return newlyUnlocked
}

export async function getUnlockedKeys(userId: string): Promise<string[]> {
  const rows = await prisma.achievement.findMany({ where: { userId }, select: { key: true } })
  return rows.map((r) => r.key)
}

/** 有新解鎖的話，主動推播一則 LINE 通知；沒有 LINE 帳號或沒有新解鎖就直接跳過。
 * 用 push 而不是 reply，因為呼叫的時間點（網頁打卡、postback 處理完）通常已經沒有
 * 可用的 replyToken 了（LINE 的 replyToken 只能用一次）。 */
export async function notifyUnlocks(userId: string, newlyUnlocked: string[]): Promise<void> {
  if (newlyUnlocked.length === 0) return
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lineUserId: true } })
  if (!user?.lineUserId) return
  const labels = newlyUnlocked.map((key) => ACHIEVEMENT_LABELS[key] ?? key).join('、')
  try {
    await pushMessages(user.lineUserId, [textMessage(`🎉 恭喜解鎖「${labels}」功能！快去 App 裡看看吧！`)])
  } catch (err) {
    console.error('[achievements] 解鎖通知推播失敗', user.lineUserId, err)
  }
}
