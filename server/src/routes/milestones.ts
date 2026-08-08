import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'

export const milestonesRouter = Router()
milestonesRouter.use(requireAuth)

const milestoneInput = z.object({
  title: z.string().min(1),
  tag: z.string().min(1),
  tagBg: z.string().min(1),
  tagCol: z.string().min(1),
  desc: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  color: z.string().min(1),
  module: z.string().min(1),
})

const milestonePatch = milestoneInput.partial()

milestonesRouter.get('/', async (req, res) => {
  const milestones = await prisma.milestone.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: milestones })
})

milestonesRouter.post('/', async (req, res, next) => {
  try {
    const body = milestoneInput.parse(req.body)
    const milestone = await prisma.milestone.create({ data: { ...body, userId: req.userId } })
    res.status(201).json({ ok: true, data: milestone })
  } catch (err) {
    next(err)
  }
})

milestonesRouter.patch('/:id', async (req, res, next) => {
  try {
    const body = milestonePatch.parse(req.body)
    const exists = await prisma.milestone.findUnique({ where: { id: req.params.id } })
    if (!exists || exists.userId !== req.userId) throw ApiBusinessError.notFound('Milestone')
    const milestone = await prisma.milestone.update({ where: { id: req.params.id }, data: body })
    res.json({ ok: true, data: milestone })
  } catch (err) {
    next(err)
  }
})

milestonesRouter.delete('/:id', async (req, res, next) => {
  try {
    const exists = await prisma.milestone.findUnique({ where: { id: req.params.id } })
    if (!exists || exists.userId !== req.userId) throw ApiBusinessError.notFound('Milestone')
    await prisma.milestone.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
