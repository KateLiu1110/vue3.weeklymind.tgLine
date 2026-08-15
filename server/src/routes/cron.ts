import { Router } from 'express'
import { sendDailyCheckin, sendWeeklyReport } from '../services/reminder.js'

export const cronRouter = Router()

cronRouter.post('/', async (req, res) => {
  const secret = process.env.CRON_SECRET
  const provided = typeof req.headers['x-cron-secret'] === 'string' ? req.headers['x-cron-secret'] : null

  if (secret && provided !== secret) {
    res.status(401).json({ ok: false, error: 'invalid_cron_secret' })
    return
  }

  const kind = typeof req.body?.kind === 'string' ? req.body.kind : 'daily'

  try {
    if (kind === 'weekly') {
      await sendWeeklyReport()
      res.json({ ok: true, message: 'weekly reminder sent' })
      return
    }

    await sendDailyCheckin()
    res.json({ ok: true, message: 'daily reminder sent' })
  } catch (error) {
    console.error('[cron] failed', error)
    res.status(500).json({ ok: false, error: 'cron_failed' })
  }
})
