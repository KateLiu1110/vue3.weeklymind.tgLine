import cron from 'node-cron'
import { prisma } from '../db.js'
import { pushMessages, getCheckListFlex } from './line.js'

// 每天固定時間主動推播打卡清單，例如 "0 8 * * *" = 每天 08:00
const DAILY_CHECKIN_CRON = process.env.DAILY_CHECKIN_CRON ?? '0 8 * * *'
const DAILY_CHECKIN_TIMEZONE = process.env.DAILY_CHECKIN_TIMEZONE ?? 'Asia/Taipei'

async function sendDailyCheckin() {
  const users = await prisma.user.findMany({ where: { lineUserId: { not: null } } })
  for (const user of users) {
    if (!user.lineUserId) continue
    try {
      await pushMessages(user.lineUserId, [
        { type: 'flex', altText: '每日任務 CheckList', contents: await getCheckListFlex(user.id) },
      ])
      console.log('[reminder] 已推播每日打卡清單給', user.lineUserId)
    } catch (err) {
      console.error('[reminder] 推播失敗', user.lineUserId, err)
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
