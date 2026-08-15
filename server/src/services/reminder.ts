import cron from 'node-cron'
import { prisma } from '../db.js'
import { pushMessages, getCheckListFlex, getWeeklyReportFlex } from './line.js'
import { normalizeBotLang, t } from './lineMessages.js'

// 每天固定時間主動推播打卡清單，例如 "0 8 * * *" = 每天 08:00
const DAILY_CHECKIN_CRON = process.env.DAILY_CHECKIN_CRON ?? '0 8 * * *'
const DAILY_CHECKIN_TIMEZONE = process.env.DAILY_CHECKIN_TIMEZONE ?? 'Asia/Taipei'

// 每週固定時間主動推播本週回顧，例如 "0 21 * * 5" = 每週五 21:00
const WEEKLY_REPORT_CRON = process.env.WEEKLY_REPORT_CRON ?? '0 21 * * 5'
const WEEKLY_REPORT_TIMEZONE = process.env.WEEKLY_REPORT_TIMEZONE ?? DAILY_CHECKIN_TIMEZONE

export async function sendDailyCheckin() {
  const users = await prisma.user.findMany({ where: { lineUserId: { not: null } } })
  for (const user of users) {
    if (!user.lineUserId) continue
    const lang = normalizeBotLang(user.botLang)
    try {
      await pushMessages(user.lineUserId, [
        { type: 'flex', altText: t(lang, 'checklistTitle'), contents: await getCheckListFlex(user.id, lang) },
      ])
      console.log('[reminder] 已推播每日打卡清單給', user.lineUserId)
    } catch (err) {
      console.error('[reminder] 推播失敗', user.lineUserId, err)
    }
  }
}

export async function sendWeeklyReport() {
  const users = await prisma.user.findMany({ where: { lineUserId: { not: null } } })
  for (const user of users) {
    if (!user.lineUserId) continue
    const lang = normalizeBotLang(user.botLang)
    try {
      await pushMessages(user.lineUserId, [
        { type: 'flex', altText: t(lang, 'weeklyTitle'), contents: await getWeeklyReportFlex(user.id, lang) },
      ])
      console.log('[reminder] 已推播本週回顧給', user.lineUserId)
    } catch (err) {
      console.error('[reminder] 週報推播失敗', user.lineUserId, err)
    }
  }
}

export function startDailyCheckinReminder() {
  cron.schedule(
    DAILY_CHECKIN_CRON,
    () => {
      sendDailyCheckin().catch((err) => console.error('[reminder] 每日推播批次失敗', err))
    },
    { timezone: DAILY_CHECKIN_TIMEZONE },
  )

  console.log(`[reminder] 每日打卡推播已排程（cron: "${DAILY_CHECKIN_CRON}", timezone: ${DAILY_CHECKIN_TIMEZONE}）`)
}

export function startWeeklyReportReminder() {
  cron.schedule(
    WEEKLY_REPORT_CRON,
    () => {
      sendWeeklyReport().catch((err) => console.error('[reminder] 週報推播批次失敗', err))
    },
    { timezone: WEEKLY_REPORT_TIMEZONE },
  )

  console.log(`[reminder] 每週回顧推播已排程（cron: "${WEEKLY_REPORT_CRON}", timezone: ${WEEKLY_REPORT_TIMEZONE}）`)
}
