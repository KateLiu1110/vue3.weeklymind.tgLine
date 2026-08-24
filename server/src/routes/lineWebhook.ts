import { Router, type ErrorRequestHandler } from 'express'
import * as line from '@line/bot-sdk'
import { prisma } from '../db.js'
import { detectIntent, pickChatReply, type Intent } from '../services/ai.js'
import {
  replyMessages,
  textMessage,
  buildLinkClassificationFlex,
  getCheckListFlex,
  getWeeklyReportFlex,
  getRetroAnalysisFlex,
} from '../services/line.js'
import { detectPlatform } from '../services/linkClassifier.js'
import { checkAndUnlockAchievements, notifyUnlocks, getUnlockedKeys, ACHIEVEMENT_KEYS } from '../lib/achievements.js'
import { normalizeBotLang, t, CHECKLIST_KEYWORDS, WEEKLY_REPORT_KEYWORDS, RETRO_KEYWORDS } from '../services/lineMessages.js'

// --- 初始化 LINE 設定 ---
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '',
  channelSecret: process.env.LINE_CHANNEL_SECRET ?? '',
}

export const lineWebhookRouter = Router()

// --- 錯誤處理 ---
const handleWebhookError: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof line.SignatureValidationFailed) {
    res.status(401).json({ error: 'invalid signature' })
    return
  }
  next(err)
}

// --- 主要 Webhook 入口 ---
// 注意：line.middleware() 需要原始（未被 express.json() 解析過的）request body 來驗證
// 簽章，所以這個 router 必須掛在 server/src/index.ts 裡 express.json() 之前。
// 只有當 channelSecret 存在時才使用 LINE 中間件驗證
if (config.channelSecret) {
  lineWebhookRouter.post('/', line.middleware(config), async (req, res) => {
    const events = (req.body.events ?? []) as line.webhook.Event[]
    await Promise.all(events.map((event) => handleEvent(event).catch((err) => console.error('[line-webhook]', err))))
    res.status(200).end()
  })
} else {
  // 如果沒有設定 channelSecret，使用虛擬路由（用於測試）
  lineWebhookRouter.post('/', async (req, res) => {
    console.warn('[line-webhook] No LINE_CHANNEL_SECRET configured, webhook verification skipped')
    const events = (req.body.events ?? []) as line.webhook.Event[]
    await Promise.all(events.map((event) => handleEvent(event).catch((err) => console.error('[line-webhook]', err))))
    res.status(200).end()
  })
}

lineWebhookRouter.use(handleWebhookError)

// --- 帳號解析：加好友的瞬間就完成「註冊 + 登入」，不需要輸入任何東西 ---
async function resolveUser(event: line.webhook.Event): Promise<{ id: string; botLang: string } | null> {
  if (event.source?.type !== 'user' || !event.source.userId) return null
  const lineUserId = event.source.userId
  const user = await prisma.user.upsert({
    where: { lineUserId },
    update: {},
    create: { lineUserId, botPlatform: 'line' },
  })
  return { id: user.id, botLang: user.botLang }
}

// --- 事件處理核心 ---
async function handleEvent(event: line.webhook.Event) {
  const user = await resolveUser(event)
  if (!user) return
  const userId = user.id
  const lang = normalizeBotLang(user.botLang)

  if (event.type === 'follow' && event.replyToken) {
    await replyMessages(event.replyToken, [textMessage(t(lang, 'welcome'))])
    return
  }

  if (event.type === 'message' && event.message.type === 'text' && event.replyToken) {
    const text = event.message.text
    if (CHECKLIST_KEYWORDS.includes(text)) {
      return await replyMessages(event.replyToken, [
        { type: 'flex', altText: t(lang, 'checklistTitle'), contents: await getCheckListFlex(userId, lang) },
      ])
    }
    if (WEEKLY_REPORT_KEYWORDS.includes(text)) {
      return await replyMessages(event.replyToken, [
        { type: 'flex', altText: t(lang, 'weeklyTitle'), contents: await getWeeklyReportFlex(userId, lang) },
      ])
    }
    if (RETRO_KEYWORDS.includes(text)) {
      const unlocked = await getUnlockedKeys(userId)
      if (!unlocked.includes(ACHIEVEMENT_KEYS.retro)) {
        return await replyMessages(event.replyToken, [textMessage(t(lang, 'retroLocked'))])
      }
      return await replyMessages(event.replyToken, [
        { type: 'flex', altText: t(lang, 'retroTitle'), contents: await getRetroAnalysisFlex(userId, lang) },
      ])
    }
    await handleTextMessage(userId, event.replyToken, text)
    await notifyUnlocks(userId, await checkAndUnlockAchievements(userId))
    return
  }

  if (event.type === 'postback' && event.replyToken) {
    await handlePostback(userId, event.replyToken, event.postback.data)
    await notifyUnlocks(userId, await checkAndUnlockAchievements(userId))
  }
}

// --- 邏輯處理區 ---
async function handleTextMessage(userId: string, replyToken: string, text: string) {
  const intent = detectIntent(text)
  switch (intent.type) {
    case 'url':
      await handleUrlIntent(userId, replyToken, text)
      break
    case 'sport':
      await handleSportIntent(userId, replyToken, intent)
      break
    case 'toeic':
      await handleToeicIntent(userId, replyToken, intent)
      break
    case 'learning':
      await handleLearningIntent(userId, replyToken, text, intent.category)
      break
    case 'chat':
      await replyMessages(replyToken, [textMessage(pickChatReply())])
      break
  }
}

async function handleUrlIntent(userId: string, replyToken: string, url: string) {
  const platform = detectPlatform(url)
  const rule = await prisma.linkRule.findFirst({ where: { userId, platform } })
  const category = rule?.category ?? '未分類'
  const link = await prisma.savedLink.create({ data: { userId, url, platform, category } })
  await replyMessages(replyToken, [buildLinkClassificationFlex({ linkId: link.id, platform, category })])
}

async function getWeeklyRunKm(userId: string) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const logs = await prisma.sportLog.findMany({
    where: { userId, category: 'run', loggedAt: { gte: weekAgo } },
  })
  return logs.reduce((sum, l) => sum + Number(l.distanceKm ?? 0), 0)
}

async function handleSportIntent(userId: string, replyToken: string, intent: Extract<Intent, { type: 'sport' }>) {
  await prisma.sportLog.create({
    data: { userId, category: intent.category, distanceKm: intent.distanceKm },
  })
  if (intent.category === 'run') {
    const weeklyKm = await getWeeklyRunKm(userId)
    await replyMessages(replyToken, [
      textMessage(`${intent.distanceKm ?? ''}km 記錄完成！本週累計 ${weeklyKm.toFixed(1)}km 🏃`),
    ])
    return
  }
  const label = intent.category === 'gym' ? '健身力量' : '瑜珈'
  await replyMessages(replyToken, [textMessage(`記錄完成！${label}訓練已存入本週紀錄 💪`)])
}

async function handleToeicIntent(userId: string, replyToken: string, intent: Extract<Intent, { type: 'toeic' }>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  await prisma.toeicProgress.upsert({
    where: { userId_date: { userId, date: today } },
    update: {
      vocabDone: intent.vocabDone || undefined,
      readingDone: intent.readingDone || undefined,
    },
    create: {
      userId,
      date: today,
      vocabDone: !!intent.vocabDone,
      readingDone: !!intent.readingDone,
      clozeDone: !!intent.clozeDone,
      dialogueDone: !!intent.dialogueDone,
      textbookPct: 0,
    },
  })
  await replyMessages(replyToken, [textMessage(`記錄完成！繼續保持 💪`)])
}

async function handleLearningIntent(userId: string, replyToken: string, text: string, category: string) {
  await prisma.dailyTask.create({
    data: { userId, category, title: text, source: 'line', completedAt: new Date() },
  })
  await replyMessages(replyToken, [textMessage(`收到！已記錄到「${category}」📚 繼續加油！`)])
}

// 打卡完成度要同步回 Plan.pct，不然網頁「計劃管理」頁的進度環只認網頁自己的「今日
// 打卡」按鈕，LINE 這邊打卡完成度再高，網頁看起來還是 0%——兩邊資料各自為政，感覺
// 像沒連動。透過 Plan.linkedCustomId 找回對應的計畫（見 core.ts 的 savePlan()）。
async function syncPlanProgress(moduleId: string) {
  const mod = await prisma.customModule.findUnique({
    where: { id: moduleId },
    include: {
      dailyTasks: true,
      tabCats: { include: { items: true } },
      boardColumns: { include: { items: true } },
    },
  })
  if (!mod) return

  let pct = 0
  if (mod.kind === 'goal' && mod.dailyTasks.length > 0) {
    pct = Math.round((mod.dailyTasks.filter((t) => t.done).length / mod.dailyTasks.length) * 100)
  } else if (mod.kind === 'tab') {
    const items = mod.tabCats.flatMap((c) => c.items)
    if (items.length > 0) pct = Math.round((items.filter((i) => i.done).length / items.length) * 100)
  } else if (mod.kind === 'board') {
    const total = mod.boardColumns.reduce((sum, c) => sum + c.items.length, 0)
    const done = mod.boardColumns.find((c) => c.label === '已完成')?.items.length ?? 0
    if (total > 0) pct = Math.round((done / total) * 100)
  }

  await prisma.plan.updateMany({ where: { linkedCustomId: moduleId }, data: { pct } })
}

// 「新增計畫」選目標模板時填的每日任務（見 services/line.ts 的 getCheckListFlex 動態區塊）。
async function checkinCustomTask(userId: string, taskId: string) {
  const task = await prisma.customModuleDailyTask.findUnique({ where: { id: taskId }, include: { module: true } })
  if (!task || task.module.userId !== userId) return
  await prisma.customModuleDailyTask.update({ where: { id: taskId }, data: { done: true } })
  await syncPlanProgress(task.moduleId)
}

// 「新增計畫」選 Tab 模板時填的分類清單項目，同一個動態區塊底下的另一種模板。
async function checkinCustomTabItem(userId: string, itemId: string) {
  const item = await prisma.customTabItem.findUnique({
    where: { id: itemId },
    include: { category: { include: { module: true } } },
  })
  if (!item || item.category.module.userId !== userId) return
  await prisma.customTabItem.update({ where: { id: itemId }, data: { done: true } })
  await syncPlanProgress(item.category.moduleId)
}

// 看板卡片沒有 done 欄位，「打卡」＝把卡片從待辦欄移到已完成欄（跟網頁看板拖曳到
// 「已完成」欄是同一件事）。找不到卡片、或卡片不屬於這個使用者、或這個模組沒有
// 「已完成」欄（理論上不會發生，見 customModules.ts 建立時的預設欄位）就直接跳過。
async function checkinCustomBoardItem(userId: string, itemId: string) {
  const item = await prisma.customBoardItem.findUnique({
    where: { id: itemId },
    include: { column: { include: { module: true } } },
  })
  if (!item || item.column.module.userId !== userId) return
  const doneColumn = await prisma.customBoardColumn.findFirst({
    where: { moduleId: item.column.moduleId, label: '已完成' },
  })
  if (!doneColumn) return
  const doneCount = await prisma.customBoardItem.count({ where: { columnId: doneColumn.id } })
  await prisma.customBoardItem.update({ where: { id: itemId }, data: { columnId: doneColumn.id, order: doneCount } })
  await syncPlanProgress(item.column.moduleId)
}

// 「一鍵完成所有項目」把所有看板模組「待辦」欄的卡片都移到「已完成」欄，跟上面
// 單張卡片的邏輯一樣，只是要一次處理多個模組、多張卡片，且要維持各自的欄內順序。
async function checkinAllBoardItems(userId: string) {
  const boardModules = await prisma.customModule.findMany({
    where: { userId, kind: 'board' },
    include: { boardColumns: { include: { items: true } } },
  })
  for (const mod of boardModules) {
    const todoColumn = mod.boardColumns.find((c) => c.label === '待辦')
    const doneColumn = mod.boardColumns.find((c) => c.label === '已完成')
    if (!todoColumn || !doneColumn || todoColumn.items.length === 0) continue
    let order = doneColumn.items.length
    for (const item of todoColumn.items) {
      await prisma.customBoardItem.update({ where: { id: item.id }, data: { columnId: doneColumn.id, order: order++ } })
    }
    await syncPlanProgress(mod.id)
  }
}

// 一鍵完成用 updateMany 一次改完所有目標/Tab 模組的任務，事後要各自重算 pct 同步回
// 對應的 Plan（不能在 updateMany 裡順便做，Prisma 的 updateMany 不會回傳改了哪些列）。
async function checkinAllGoalTasks(userId: string) {
  const modules = await prisma.customModule.findMany({ where: { userId, kind: 'goal' }, select: { id: true } })
  await prisma.customModuleDailyTask.updateMany({ where: { done: false, module: { userId, kind: 'goal' } }, data: { done: true } })
  await Promise.all(modules.map((m) => syncPlanProgress(m.id)))
}

async function checkinAllTabItems(userId: string) {
  const modules = await prisma.customModule.findMany({ where: { userId, kind: 'tab' }, select: { id: true } })
  await prisma.customTabItem.updateMany({ where: { done: false, category: { module: { userId, kind: 'tab' } } }, data: { done: true } })
  await Promise.all(modules.map((m) => syncPlanProgress(m.id)))
}

async function checkinAll(userId: string) {
  await Promise.all([checkinAllGoalTasks(userId), checkinAllTabItems(userId), checkinAllBoardItems(userId)])
}

async function handlePostback(userId: string, replyToken: string, data: string) {
  const params = new URLSearchParams(data)

  if (params.get('action') === 'confirm_link') {
    await replyMessages(replyToken, [textMessage('已確認分類 👍')])
    return
  }

  switch (params.get('type')) {
    case 'custom_task': {
      const taskId = params.get('id')
      if (taskId) await checkinCustomTask(userId, taskId)
      await replyMessages(replyToken, [textMessage('✅ 已記錄，繼續保持 💪')])
      return
    }
    case 'custom_tab_item': {
      const itemId = params.get('id')
      if (itemId) await checkinCustomTabItem(userId, itemId)
      await replyMessages(replyToken, [textMessage('✅ 已記錄，繼續保持 💪')])
      return
    }
    case 'custom_board_item': {
      const itemId = params.get('id')
      if (itemId) await checkinCustomBoardItem(userId, itemId)
      await replyMessages(replyToken, [textMessage('✅ 已移到已完成，繼續保持 💪')])
      return
    }
    case 'all_done': {
      await checkinAll(userId)
      await replyMessages(replyToken, [textMessage('🎉 今日任務全部完成！繼續保持 💪')])
      return
    }
  }
}
