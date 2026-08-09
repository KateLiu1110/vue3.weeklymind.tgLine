import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth, requireUnlocked } from '../middleware/auth.js'
import { ACHIEVEMENT_KEYS } from '../lib/achievements.js'
import { detectPlatform } from '../services/linkClassifier.js'

export const linksRouter = Router()
linksRouter.use(requireAuth, requireUnlocked(ACHIEVEMENT_KEYS.links))

linksRouter.get('/', async (req, res) => {
  const links = await prisma.savedLink.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: links })
})

const linkInput = z.object({ title: z.string().min(1), url: z.string().min(1), category: z.string().optional() })

linksRouter.post('/', async (req, res, next) => {
  try {
    const body = linkInput.parse(req.body)
    const platform = detectPlatform(body.url)
    const link = await prisma.savedLink.create({
      data: { title: body.title, url: body.url, category: body.category || '未分類', platform, userId: req.userId },
    })
    res.status(201).json({ ok: true, data: link })
  } catch (err) {
    next(err)
  }
})

linksRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.savedLink.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('SavedLink')
    await prisma.savedLink.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
