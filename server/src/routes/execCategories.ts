import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'

export const execCategoriesRouter = Router()
execCategoriesRouter.use(requireAuth)

execCategoriesRouter.get('/', async (req, res) => {
  const categories = await prisma.execCategory.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: categories })
})

const categoryInput = z.object({ name: z.string().min(1), value: z.number().min(0).max(100), color: z.string().min(1) })

execCategoriesRouter.post('/', async (req, res, next) => {
  try {
    const body = categoryInput.parse(req.body)
    const category = await prisma.execCategory.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: category })
  } catch (err) {
    next(err)
  }
})

execCategoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.execCategory.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('ExecCategory')
    await prisma.execCategory.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
