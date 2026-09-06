import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth, requireUnlocked } from '../middleware/auth.js'
import { ACHIEVEMENT_KEYS } from '../lib/achievements.js'
import { getDailyActivityCounts, toDateKey } from '../lib/streak.js'

export const retroRouter = Router()
retroRouter.use(requireAuth, requireUnlocked(ACHIEVEMENT_KEYS.retro))

retroRouter.get('/', async (req, res) => {
  const goals = await prisma.retroGoal.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
  res.json({ ok: true, data: goals })
})

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

/** 「本週達成率變化」「各分類達成率佔比」原本是這頁固定的示意資料，跟使用者實際
 * 打卡狀況無關。現在改成：
 * - weekBars：本週一到週日，每天的「每日任務完成／運動紀錄／多益每日打卡」筆數
 *   ——跟 lib/streak.ts 的連續打卡天數用同一份資料源，確保兩邊看到的是同一件事。
 * - categoryShares：直接用使用者的 Plan（title/pct/color）——跟計劃管理、執行中心
 *   雷達圖顯示的是同一批計畫、同一個完成度算法、同一組顏色，不是另外一套假分類。
 */
retroRouter.get('/summary', async (req, res) => {
  const userId = req.userId

  // 「本週」要照台北時間算星期一，不是伺服器自己的系統時區——所以先用 toDateKey
  // （已經是 Asia/Taipei）拿到今天的日期字串，用 UTC 錨定的方式做星期幾/加減天數的
  // 純日曆運算（不再牽涉時區換算），最後查資料庫的 since 邊界才換算回「台北該日
  // 00:00」對應的真實 UTC 時間點，不然本週一 00:00–08:00 這段會被漏算或多算。
  const todayKey = toDateKey(new Date())
  const todayUtcAnchor = new Date(`${todayKey}T00:00:00Z`)
  const dow = todayUtcAnchor.getUTCDay()
  const mondayUtcAnchor = new Date(todayUtcAnchor)
  mondayUtcAnchor.setUTCDate(mondayUtcAnchor.getUTCDate() + (dow === 0 ? -6 : 1 - dow))
  const mondayKey = toDateKey(mondayUtcAnchor)
  const mondayTaipeiMidnight = new Date(`${mondayKey}T00:00:00+08:00`)

  const [counts, plans] = await Promise.all([
    getDailyActivityCounts(userId, mondayTaipeiMidnight),
    prisma.plan.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
  ])

  const weekBars = WEEKDAY_LABELS.map((label, i) => {
    const d = new Date(mondayUtcAnchor)
    d.setUTCDate(d.getUTCDate() + i)
    const key = toDateKey(d)
    return { label, date: key, count: counts.get(key) ?? 0 }
  })

  const categoryShares = plans.map((p) => ({ id: p.id, name: p.title, value: p.pct, color: p.color }))

  res.json({ ok: true, data: { weekBars, categoryShares } })
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
