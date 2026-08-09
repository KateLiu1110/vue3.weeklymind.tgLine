import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'

export const toeicRouter = Router()
toeicRouter.use(requireAuth)

const DEFAULT_PROFILE = {
  goalTitle: '多益目標 600 分',
  goalDesc: '',
  classSchedule: '',
  lastMockScore: 0,
  targetScore: 0,
  scoreTrend: [] as unknown[],
}

// 整頁一次回傳：profile（單筆）+ examDates + tasks，前端一支 API 就能組出整個「多益英文」頁面。
toeicRouter.get('/', async (req, res) => {
  const [profile, examDates, tasks] = await Promise.all([
    prisma.toeicProfile.findUnique({ where: { userId: req.userId } }),
    prisma.toeicExamDate.findMany({ where: { userId: req.userId }, orderBy: { date: 'asc' } }),
    prisma.toeicTaskItem.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
  ])
  res.json({ ok: true, data: { profile: profile ?? DEFAULT_PROFILE, examDates, tasks } })
})

// 側邊欄「多益英文」的刪除入口：整頁重置，連帶把驅動這個頁面出現在側邊欄的
// module='toeic' 計畫也刪掉，刪完頁面就會自動從側邊欄消失（不需要另外的顯示旗標）。
// 注意：LINE Bot 每日打卡紀錄（ToeicProgress）是不同概念，不屬於這個頁面，不會一起刪。
toeicRouter.delete('/', async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.toeicExamDate.deleteMany({ where: { userId: req.userId } }),
      prisma.toeicTaskItem.deleteMany({ where: { userId: req.userId } }),
      prisma.toeicProfile.deleteMany({ where: { userId: req.userId } }),
      prisma.plan.deleteMany({ where: { userId: req.userId, module: 'toeic' } }),
    ])
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const profileInput = z.object({
  goalTitle: z.string().optional(),
  goalDesc: z.string().optional(),
  classSchedule: z.string().optional(),
  lastMockScore: z.number().optional(),
  targetScore: z.number().optional(),
  scoreTrend: z.array(z.unknown()).optional(),
})

toeicRouter.patch('/profile', async (req, res, next) => {
  try {
    const body = profileInput.parse(req.body)
    const data = body as Prisma.ToeicProfileUncheckedUpdateInput
    const profile = await prisma.toeicProfile.upsert({
      where: { userId: req.userId },
      update: data,
      create: { userId: req.userId, ...DEFAULT_PROFILE, ...body } as Prisma.ToeicProfileUncheckedCreateInput,
    })
    res.json({ ok: true, data: profile })
  } catch (err) {
    next(err)
  }
})

const examDateInput = z.object({ title: z.string().min(1), date: z.string().min(1) })

toeicRouter.post('/exam-dates', async (req, res, next) => {
  try {
    const body = examDateInput.parse(req.body)
    const examDate = await prisma.toeicExamDate.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: examDate })
  } catch (err) {
    next(err)
  }
})

toeicRouter.delete('/exam-dates/:id', async (req, res, next) => {
  try {
    const existing = await prisma.toeicExamDate.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('ToeicExamDate')
    await prisma.toeicExamDate.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const taskInput = z.object({
  title: z.string().min(1),
  iconKey: z.string().optional(),
  todayLabel: z.string().optional(),
  pct: z.number().min(0).max(100).optional(),
  done: z.boolean().optional(),
})
const taskPatch = taskInput.partial()

toeicRouter.post('/tasks', async (req, res, next) => {
  try {
    const body = taskInput.parse(req.body)
    const task = await prisma.toeicTaskItem.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: task })
  } catch (err) {
    next(err)
  }
})

toeicRouter.patch('/tasks/:id', async (req, res, next) => {
  try {
    const body = taskPatch.parse(req.body)
    const existing = await prisma.toeicTaskItem.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('ToeicTaskItem')
    const task = await prisma.toeicTaskItem.update({ where: { id: req.params.id }, data: body })
    res.json({ ok: true, data: task })
  } catch (err) {
    next(err)
  }
})

toeicRouter.delete('/tasks/:id', async (req, res, next) => {
  try {
    const existing = await prisma.toeicTaskItem.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('ToeicTaskItem')
    await prisma.toeicTaskItem.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
