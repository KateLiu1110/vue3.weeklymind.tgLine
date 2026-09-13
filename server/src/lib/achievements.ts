import { prisma } from '../db.js'
import { pushMessages, textMessage } from '../services/line.js'

// 解鎖條件（沒有指定明確門檻時的合理預設，之後要調整只要改這個檔案）：
//   連結收藏、LineBot 設定：目前沒有自動解鎖條件，只能手動解鎖。連結收藏原本是
//   「新增第一個計畫」就解鎖，但這代表「新增計畫」這個單純的建立/設定動作會附帶
//   觸發解鎖＋LINE 通知，使用者體感上像是「新增計畫」莫名其妙多做了別的事，改成
//   不自動解鎖；LineBot 設定沿用同一個「先鎖住、之後再決定解鎖條件」的做法。
//   覆盤中心：累積打卡次數達到 5 次（要有足夠的打卡紀錄才有東西可以回顧）
//   主題色彩：累積打卡次數達到 15 次（沒有真的金流／訂閱機制，這裡沿用跟其他工具
//   一樣「用得夠久就解鎖」的邏輯，取代原本設想的「付費 Pro」門檻）
export const ACHIEVEMENT_KEYS = {
  links: 'links_unlocked',
  retro: 'retro_unlocked',
  theme: 'theme_unlocked',
  linebot: 'linebot_unlocked',
} as const

export const ACHIEVEMENT_LABELS: Record<string, string> = {
  [ACHIEVEMENT_KEYS.links]: '連結收藏',
  [ACHIEVEMENT_KEYS.retro]: '覆盤中心',
  [ACHIEVEMENT_KEYS.theme]: '主題色彩',
  [ACHIEVEMENT_KEYS.linebot]: 'LineBot 設定',
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

/** 自訂模組（目標/看板/Tab 範本，「新增計畫」建出來的頁面）裡打勾/移完成的項目數，
 * 橫跨使用者所有模組。算法對齊前端 stores/exec.ts 的 checkedGoalsCount getter——
 * 兩邊看到的「打了幾次卡」要是同一個答案，不是各自一套。 */
async function getCustomModuleCheckins(userId: string): Promise<number> {
  const modules = await prisma.customModule.findMany({
    where: { userId },
    include: {
      dailyTasks: { select: { done: true } },
      tabCats: { include: { items: { select: { done: true } } } },
      boardColumns: { select: { label: true, items: { select: { id: true } } } },
    },
  })
  let count = 0
  for (const mod of modules) {
    if (mod.kind === 'goal') count += mod.dailyTasks.filter((t) => t.done).length
    else if (mod.kind === 'tab') count += mod.tabCats.flatMap((c) => c.items).filter((i) => i.done).length
    else if (mod.kind === 'board') count += mod.boardColumns.find((c) => c.label === '已完成')?.items.length ?? 0
  }
  return count
}

/** 累積打卡次數：網頁「今日打卡」、自訂模組（目標/看板/Tab 範本）打勾、臨時待辦事項、
 * LINE Bot 打卡（運動/多益/學習紀錄）都算，覆盤中心跟主題色彩兩個解鎖條件共用同一套
 * 計算方式，只是門檻不同。 */
async function getTotalCheckins(userId: string): Promise<number> {
  const [planCheckins, sportLogs, toeicDays, dailyTasks, customModuleCheckins] = await Promise.all([
    prisma.plan.aggregate({ where: { userId }, _sum: { checkinsDone: true } }),
    prisma.sportLog.count({ where: { userId } }),
    prisma.toeicProgress.count({ where: { userId } }),
    prisma.dailyTask.count({ where: { userId } }),
    getCustomModuleCheckins(userId),
  ])
  return (planCheckins._sum.checkinsDone ?? 0) + sportLogs + toeicDays + dailyTasks + customModuleCheckins
}

/** 在任何可能改變解鎖條件的動作之後呼叫（新增計畫、打卡）；已解鎖的不會重複判斷。
 * 回傳這次「新」解鎖的 key 清單（沒有新解鎖就是空陣列），呼叫端可以用這個決定要不要
 * 通知使用者，見 notifyUnlocks()。 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const [retroUnlocked, themeUnlocked] = await Promise.all([
    isUnlocked(userId, ACHIEVEMENT_KEYS.retro),
    isUnlocked(userId, ACHIEVEMENT_KEYS.theme),
  ])

  const newlyUnlocked: string[] = []
  const tasks: Promise<unknown>[] = []

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

/** 給存檔動作結束後「不擋回應」的呼叫端用（見 routes/customModules.ts、routes/dailyTasks.ts）：
 * res.json() 送出之後才觸發，本身沒有 await，所以呼叫端一定要把這支的 Promise 吞掉，
 * 不能整條沒接 .catch() 就丟著——沒接住的話，這裡任何一步出錯都會變成 unhandled
 * rejection，Node 預設會直接把整個 process 砍掉（等於一次背景檢查失敗，全站當機）。
 * plans.ts 的「今日打卡」是唯一例外：它在 res.json() 之前 await，已經在路由自己的
 * try/catch 裡，所以繼續用 checkAndUnlockAchievements + notifyUnlocks 那組即可。 */
export async function checkAndNotifyAchievementsSafely(userId: string): Promise<void> {
  try {
    const newlyUnlocked = await checkAndUnlockAchievements(userId)
    await notifyUnlocks(userId, newlyUnlocked)
  } catch (err) {
    console.error('[achievements] 背景解鎖檢查失敗', userId, err)
  }
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
