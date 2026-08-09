import { Router } from 'express'
import { getStreakDays } from '../lib/streak.js'
import { requireAuth } from '../middleware/auth.js'

export const streakRouter = Router()
streakRouter.use(requireAuth)

streakRouter.get('/', async (req, res, next) => {
  try {
    const streakDays = await getStreakDays(req.userId)
    res.json({ ok: true, data: { streakDays } })
  } catch (err) {
    next(err)
  }
})
