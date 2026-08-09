import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'

export const sportRouter = Router()
sportRouter.use(requireAuth)

// 整頁一次回傳：分類分頁 + 底下的待辦清單，前端自己依 category 分組。
sportRouter.get('/', async (req, res) => {
  const [categories, todos] = await Promise.all([
    prisma.sportCategoryTab.findMany({ where: { userId: req.userId }, orderBy: { order: 'asc' } }),
    prisma.sportTodoItem.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
  ])
  res.json({ ok: true, data: { categories, todos } })
})

// 側邊欄「運動」的刪除入口：整頁重置，連帶把驅動這個頁面出現在側邊欄的
// module='sport' 計畫也刪掉，刪完頁面就會自動從側邊欄消失（不需要另外的顯示旗標）。
// 注意：LINE Bot 打卡紀錄（SportLog）是不同概念，不屬於這個頁面，不會一起刪。
sportRouter.delete('/', async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.sportTodoItem.deleteMany({ where: { userId: req.userId } }),
      prisma.sportCategoryTab.deleteMany({ where: { userId: req.userId } }),
      prisma.plan.deleteMany({ where: { userId: req.userId, module: 'sport' } }),
    ])
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const categoryInput = z.object({ name: z.string().min(1) })

sportRouter.post('/categories', async (req, res, next) => {
  try {
    const { name } = categoryInput.parse(req.body)
    const count = await prisma.sportCategoryTab.count({ where: { userId: req.userId } })
    const category = await prisma.sportCategoryTab.create({ data: { name, order: count, userId: req.userId } })
    res.status(201).json({ ok: true, data: category })
  } catch (err) {
    next(err)
  }
})

sportRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    const existing = await prisma.sportCategoryTab.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('SportCategoryTab')
    await prisma.sportTodoItem.deleteMany({ where: { userId: req.userId, category: existing.name } })
    await prisma.sportCategoryTab.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

const todoInput = z.object({ category: z.string().min(1), name: z.string().min(1) })

sportRouter.post('/todos', async (req, res, next) => {
  try {
    const body = todoInput.parse(req.body)
    const todo = await prisma.sportTodoItem.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: todo })
  } catch (err) {
    next(err)
  }
})

sportRouter.patch('/todos/:id/toggle', async (req, res, next) => {
  try {
    const existing = await prisma.sportTodoItem.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('SportTodoItem')
    const todo = await prisma.sportTodoItem.update({ where: { id: req.params.id }, data: { done: !existing.done } })
    res.json({ ok: true, data: todo })
  } catch (err) {
    next(err)
  }
})

sportRouter.delete('/todos/:id', async (req, res, next) => {
  try {
    const existing = await prisma.sportTodoItem.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('SportTodoItem')
    await prisma.sportTodoItem.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
