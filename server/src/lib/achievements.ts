import { prisma } from '../db.js'

// 解鎖條件（沒有指定明確門檻時的合理預設，之後要調整只要改這個檔案）：
//   連結收藏：新增第一個計畫（代表已經開始用 WeeklyMind 管理目標）
//   覆盤中心：累積打卡次數達到 5 次（要有足夠的打卡紀錄才有東西可以回顧）
export const ACHIEVEMENT_KEYS = {
  links: 'links_unlocked',
  retro: 'retro_unlocked',
} as const

const RETRO_CHECKIN_THRESHOLD = 5

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

/** 在任何可能改變解鎖條件的動作之後呼叫（新增計畫、打卡）；已解鎖的不會重複判斷。 */
export async function checkAndUnlockAchievements(userId: string): Promise<void> {
  const [linksUnlocked, retroUnlocked] = await Promise.all([
    isUnlocked(userId, ACHIEVEMENT_KEYS.links),
    isUnlocked(userId, ACHIEVEMENT_KEYS.retro),
  ])

  const tasks: Promise<unknown>[] = []

  if (!linksUnlocked) {
    tasks.push(
      prisma.plan.count({ where: { userId } }).then((count) => {
        if (count >= 1) return unlock(userId, ACHIEVEMENT_KEYS.links)
      }),
    )
  }

  if (!retroUnlocked) {
    tasks.push(
      (async () => {
        // 累積打卡次數：網頁「今日打卡」跟 LINE Bot 打卡（運動/多益/學習紀錄）都算，
        // 有足夠的紀錄才有東西可以回顧。
        const [planCheckins, sportLogs, toeicDays, dailyTasks] = await Promise.all([
          prisma.plan.aggregate({ where: { userId }, _sum: { checkinsDone: true } }),
          prisma.sportLog.count({ where: { userId } }),
          prisma.toeicProgress.count({ where: { userId } }),
          prisma.dailyTask.count({ where: { userId } }),
        ])
        const total = (planCheckins._sum.checkinsDone ?? 0) + sportLogs + toeicDays + dailyTasks
        if (total >= RETRO_CHECKIN_THRESHOLD) await unlock(userId, ACHIEVEMENT_KEYS.retro)
      })(),
    )
  }

  await Promise.all(tasks)
}

export async function getUnlockedKeys(userId: string): Promise<string[]> {
  const rows = await prisma.achievement.findMany({ where: { userId }, select: { key: true } })
  return rows.map((r) => r.key)
}
