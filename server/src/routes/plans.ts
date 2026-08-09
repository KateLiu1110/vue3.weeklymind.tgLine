import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'
import { checkAndUnlockAchievements } from '../lib/achievements.js'

export const plansRouter = Router()
plansRouter.use(requireAuth)

const planInput = z.object({
  title: z.string().min(1),
  sub: z.string().optional(),
  pct: z.number().min(0).max(100).optional(),
  checkinsDone: z.number().min(0).optional(),
  color: z.string().min(1),
  module: z.string().min(1),
  weekdays: z.array(z.number()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  startDate: z.string().nullish(),
  targetDate: z.string().nullish(),
  linkedCustomId: z.string().nullish(),
})

const planPatch = planInput.partial()

plansRouter.get('/', async (req, res) => {
  const plans = await prisma.plan.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: plans })
})

plansRouter.post('/', async (req, res, next) => {
  try {
    const body = planInput.parse(req.body)
    const plan = await prisma.plan.create({ data: { ...body, userId: req.userId } })
    await checkAndUnlockAchievements(req.userId)
    res.status(201).json({ ok: true, data: plan })
  } catch (err) {
    next(err)
  }
})

// 「今日打卡」：ExecView 的打卡按鈕，累積次數也是覆盤中心解鎖條件之一（見 lib/achievements.ts）。
plansRouter.patch('/:id/checkin', async (req, res, next) => {
  try {
    const exists = await prisma.plan.findUnique({ where: { id: req.params.id } })
    if (!exists || exists.userId !== req.userId) throw ApiBusinessError.notFound('Plan')
    const plan = await prisma.plan.update({
      where: { id: req.params.id },
      data: { checkinsDone: { increment: 1 } },
    })
    await checkAndUnlockAchievements(req.userId)
    res.json({ ok: true, data: plan })
  } catch (err) {
    next(err)
  }
})

plansRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = planPatch.parse(req.body)
    const exists = await prisma.plan.findUnique({ where: { id: req.params.id } })
    if (!exists || exists.userId !== req.userId) throw ApiBusinessError.notFound('Plan')
    const plan = await prisma.plan.update({ where: { id: req.params.id }, data: body })
    res.json({ ok: true, data: plan })
  } catch (err) {
    next(err)
  }
})

plansRouter.delete('/:id', async (req, res, next) => {
  try {
    const exists = await prisma.plan.findUnique({ where: { id: req.params.id } })
    if (!exists || exists.userId !== req.userId) throw ApiBusinessError.notFound('Plan')
    await prisma.plan.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
