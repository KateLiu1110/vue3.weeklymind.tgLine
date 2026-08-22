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

function getTodayDateOnly() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

async function checkinToeicField(userId: string, field: 'vocabDone' | 'readingDone') {
  const date = getTodayDateOnly()
  await prisma.toeicProgress.upsert({
    where: { userId_date: { userId, date } },
    update: { [field]: true },
    create: {
      userId,
      date,
      vocabDone: field === 'vocabDone',
      readingDone: field === 'readingDone',
      clozeDone: false,
      dialogueDone: false,
      textbookPct: 0,
    },
  })
}

async function checkinProject(userId: string, projectId: string) {
  await prisma.project.updateMany({ where: { id: projectId, userId }, data: { dailyPct: 100 } })
}

async function checkinLearningTask(userId: string, title: string) {
  await prisma.dailyTask.create({
    data: { userId, category: 'frontend', title, source: 'line', completedAt: new Date() },
  })
}

async function checkinRun(userId: string) {
  await prisma.sportLog.create({ data: { userId, category: 'run', distanceKm: 0 } })
  return getWeeklyRunKm(userId)
}

// 「新增計畫」選目標模板時填的每日任務（見 services/line.ts 的 getCheckListFlex 動態區塊）。
async function checkinCustomTask(userId: string, taskId: string) {
  await prisma.customModuleDailyTask.updateMany({ where: { id: taskId, module: { userId } }, data: { done: true } })
}

async function checkinAll(userId: string) {
  const doingProjects = await prisma.project.findMany({
    where: { userId, status: 'doing' },
    orderBy: { createdAt: 'asc' },
    take: 2,
  })
  await Promise.all([
    checkinToeicField(userId, 'vocabDone'),
    checkinToeicField(userId, 'readingDone'),
    ...doingProjects.map((p) => checkinProject(userId, p.id)),
    checkinLearningTask(userId, 'React x3 (含 TS)'),
    checkinLearningTask(userId, 'Python / 面試題'),
    checkinRun(userId),
    prisma.customModuleDailyTask.updateMany({ where: { done: false, module: { userId, kind: 'goal' } }, data: { done: true } }),
  ])
}

async function handlePostback(userId: string, replyToken: string, data: string) {
  const params = new URLSearchParams(data)

  if (params.get('action') === 'confirm_link') {
    await replyMessages(replyToken, [textMessage('已確認分類 👍')])
    return
  }

  switch (params.get('type')) {
    case 'toeic': {
      const isReading = params.get('field') === 'reading'
      await checkinToeicField(userId, isReading ? 'readingDone' : 'vocabDone')
      const label = isReading ? 'TOEIC 閱讀測驗' : 'TOEIC 背單字'
      await replyMessages(replyToken, [textMessage(`✅ 已完成打卡：${label}`)])
      return
    }
    case 'project': {
      const projectId = params.get('id')
      if (projectId) await checkinProject(userId, projectId)
      await replyMessages(replyToken, [textMessage('✅ 專案今日進度已完成！')])
      return
    }
    case 'task': {
      const title = params.get('title') ?? '每日學習'
      await checkinLearningTask(userId, title)
      await replyMessages(replyToken, [textMessage(`✅ 已記錄：${title}`)])
      return
    }
    case 'sport': {
      const weeklyKm = await checkinRun(userId)
      await replyMessages(replyToken, [textMessage(`✅ 已記錄本次超慢跑，本週累計 ${weeklyKm.toFixed(1)}km 🏃`)])
      return
    }
    case 'custom_task': {
      const taskId = params.get('id')
      if (taskId) await checkinCustomTask(userId, taskId)
      await replyMessages(replyToken, [textMessage('✅ 已記錄，繼續保持 💪')])
      return
    }
    case 'all_done': {
      await checkinAll(userId)
      await replyMessages(replyToken, [textMessage('🎉 今日任務全部完成！繼續保持 💪')])
      return
    }
  }
}
