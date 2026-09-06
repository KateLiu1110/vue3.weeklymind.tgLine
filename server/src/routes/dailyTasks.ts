import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'
import { checkAndNotifyAchievementsSafely } from '../lib/achievements.js'

export const dailyTasksRouter = Router()
dailyTasksRouter.use(requireAuth)

const createInput = z.object({
  title: z.string().min(1),
  category: z.string().min(1).default('待辦'),
})

// 臨時待辦事項：使用者隨時新增的一次性任務（呼應「LINE 傳自然語言→AI 解析成待辦」的規劃，
// 這裡先提供手動新增/查詢/標記完成的 CRUD；AI 解析那段之後直接寫進 lineWebhook.ts 的
// handleLearningIntent，插入同一張表即可，前端不用改）。
dailyTasksRouter.get('/', async (req, res) => {
  const tasks = await prisma.dailyTask.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json({ ok: true, data: tasks })
})

dailyTasksRouter.post('/', async (req, res, next) => {
  try {
    const body = createInput.parse(req.body)
    const task = await prisma.dailyTask.create({
      data: { ...body, userId: req.userId, source: 'web', completedAt: null },
    })
    res.status(201).json({ ok: true, data: task })
    // lib/achievements.ts 的 getTotalCheckins 把「有幾筆臨時待辦」算進累積打卡次數
    // （不分完成與否），但先前只有 Plan 的「今日打卡」跟 LINE 訊息會觸發解鎖判斷，
    // 單靠新增待辦事項永遠不會真的解鎖——這裡補上。
    void checkAndNotifyAchievementsSafely(req.userId)
  } catch (err) {
    next(err)
  }
})

dailyTasksRouter.patch('/:id/toggle', async (req, res, next) => {
  try {
    const existing = await prisma.dailyTask.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('DailyTask')
    const task = await prisma.dailyTask.update({
      where: { id: req.params.id },
      data: { completedAt: existing.completedAt ? null : new Date() },
    })
    res.json({ ok: true, data: task })
    void checkAndNotifyAchievementsSafely(req.userId)
  } catch (err) {
    next(err)
  }
})

dailyTasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.dailyTask.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('DailyTask')
    await prisma.dailyTask.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
