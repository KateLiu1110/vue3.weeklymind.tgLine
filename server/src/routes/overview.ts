import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'

export const overviewRouter = Router()
overviewRouter.use(requireAuth)

// Dashboard 首頁一次回傳：目標句子 + 行程提醒 + 專注任務 + 成長目標 + 今日小成就。
overviewRouter.get('/', async (req, res) => {
  const [user, schedules, focusTasks, growthGoals, smallAchievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId }, select: { goalTitle: true } }),
    prisma.schedule.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
    prisma.focusTask.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
    prisma.growthGoal.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
    prisma.smallAchievement.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
  ])
  res.json({
    ok: true,
    data: { goalTitle: user?.goalTitle ?? '', schedules, focusTasks, growthGoals, achievements: smallAchievements },
  })
})

const goalInput = z.object({ goalTitle: z.string() })

overviewRouter.patch('/goal', async (req, res, next) => {
  try {
    const { goalTitle } = goalInput.parse(req.body)
    const user = await prisma.user.update({ where: { id: req.userId }, data: { goalTitle }, select: { goalTitle: true } })
    res.json({ ok: true, data: user })
  } catch (err) {
    next(err)
  }
})

const scheduleInput = z.object({ day: z.string().min(1), title: z.string().min(1) })

overviewRouter.post('/schedules', async (req, res, next) => {
  try {
    const body = scheduleInput.parse(req.body)
    const schedule = await prisma.schedule.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: schedule })
  } catch (err) {
    next(err)
  }
})

overviewRouter.patch('/schedules/:id/toggle-reminded', async (req, res, next) => {
  try {
    const existing = await prisma.schedule.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('Schedule')
    const schedule = await prisma.schedule.update({ where: { id: req.params.id }, data: { reminded: !existing.reminded } })
    res.json({ ok: true, data: schedule })
  } catch (err) {
    next(err)
  }
})

overviewRouter.delete('/schedules/:id', async (req, res, next) => {
  try {
    const existing = await prisma.schedule.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('Schedule')
    await prisma.schedule.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const focusTaskInput = z.object({
  title: z.string().min(1),
  module: z.string().default(''),
  moduleLabel: z.string().default(''),
  progress: z.number().min(0).max(100).default(0),
  due: z.string().default(''),
})

overviewRouter.post('/focus-tasks', async (req, res, next) => {
  try {
    const body = focusTaskInput.parse(req.body)
    const focusTask = await prisma.focusTask.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: focusTask })
  } catch (err) {
    next(err)
  }
})

overviewRouter.delete('/focus-tasks/:id', async (req, res, next) => {
  try {
    const existing = await prisma.focusTask.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('FocusTask')
    await prisma.focusTask.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const growthGoalInput = z.object({ title: z.string().min(1), sub: z.string().default(''), badgeText: z.string().default('') })

overviewRouter.post('/growth-goals', async (req, res, next) => {
  try {
    const body = growthGoalInput.parse(req.body)
    const growthGoal = await prisma.growthGoal.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: growthGoal })
  } catch (err) {
    next(err)
  }
})

overviewRouter.delete('/growth-goals/:id', async (req, res, next) => {
  try {
    const existing = await prisma.growthGoal.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('GrowthGoal')
    await prisma.growthGoal.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const achievementInput = z.object({ text: z.string().min(1) })

overviewRouter.post('/achievements', async (req, res, next) => {
  try {
    const { text } = achievementInput.parse(req.body)
    const achievement = await prisma.smallAchievement.create({ data: { text, userId: req.userId } })
    res.status(201).json({ ok: true, data: achievement })
  } catch (err) {
    next(err)
  }
})

overviewRouter.delete('/achievements/:id', async (req, res, next) => {
  try {
    const existing = await prisma.smallAchievement.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('SmallAchievement')
    await prisma.smallAchievement.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
