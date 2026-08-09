import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'

export const portfolioRouter = Router()
portfolioRouter.use(requireAuth)

portfolioRouter.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: projects })
})

const projectInput = z.object({
  name: z.string().min(1),
  caption: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
})
const projectPatch = projectInput.partial()

portfolioRouter.post('/', async (req, res, next) => {
  try {
    const body = projectInput.parse(req.body)
    const project = await prisma.project.create({ data: { status: 'todo', ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: project })
  } catch (err) {
    next(err)
  }
})

portfolioRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = projectPatch.parse(req.body)
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('Project')
    const project = await prisma.project.update({ where: { id: req.params.id }, data: body })
    res.json({ ok: true, data: project })
  } catch (err) {
    next(err)
  }
})

portfolioRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('Project')
    await prisma.project.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
