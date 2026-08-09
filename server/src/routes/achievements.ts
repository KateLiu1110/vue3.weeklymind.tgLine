import { Router } from 'express'
import { getUnlockedKeys } from '../lib/achievements.js'
import { requireAuth } from '../middleware/auth.js'

export const achievementsRouter = Router()
achievementsRouter.use(requireAuth)

achievementsRouter.get('/', async (req, res) => {
  const keys = await getUnlockedKeys(req.userId)
  res.json({ ok: true, data: { unlocked: keys } })
})
