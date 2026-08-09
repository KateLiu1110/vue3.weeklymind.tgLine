import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth, requireUnlocked } from '../middleware/auth.js'
import { ACHIEVEMENT_KEYS } from '../lib/achievements.js'

export const retroRouter = Router()
retroRouter.use(requireAuth, requireUnlocked(ACHIEVEMENT_KEYS.retro))

retroRouter.get('/', async (req, res) => {
  const goals = await prisma.retroGoal.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: goals })
})

const goalInput = z.object({ title: z.string().min(1), start: z.string().min(1), totalDays: z.number().nullish(), color: z.string().min(1) })

retroRouter.post('/', async (req, res, next) => {
  try {
    const body = goalInput.parse(req.body)
    const goal = await prisma.retroGoal.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: goal })
  } catch (err) {
    next(err)
  }
})

retroRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.retroGoal.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('RetroGoal')
    await prisma.retroGoal.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
