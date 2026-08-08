import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { signToken } from '../lib/jwt.js'

export const liffAuthRouter = Router()

const SESSION_TTL_MS = 5 * 60 * 1000

interface LiffSession {
  status: 'pending' | 'confirmed'
  expiresAt: number
  result?: { token: string; user: unknown }
}

// Demo-scale in-memory store — fine for a single-instance dev server, would
// need Redis (or a DB table) behind a real multi-instance deployment.
const sessions = new Map<string, LiffSession>()

function randomToken(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

// 後台網站呼叫：建立一個一次性 QR Code 登入 session。
liffAuthRouter.post('/session', (_req, res) => {
  const token = randomToken()
  sessions.set(token, { status: 'pending', expiresAt: Date.now() + SESSION_TTL_MS })
  const liffId = process.env.LIFF_ID
  res.json({
    ok: true,
    data: {
      token,
      expiresInSeconds: SESSION_TTL_MS / 1000,
      // LIFF_ID 還沒申請時給 null，前端顯示「尚未設定」而不是產生一個打不開的連結。
      liffUrl: liffId ? `https://liff.line.me/${liffId}?token=${token}` : null,
    },
  })
})

// 後台網站輪詢：QR Code 是否已經被手機掃描並確認登入。
liffAuthRouter.get('/session/:token', (req, res, next) => {
  try {
    const session = sessions.get(req.params.token)
    if (!session) throw ApiBusinessError.notFound('Session')
    if (Date.now() > session.expiresAt) {
      sessions.delete(req.params.token)
      throw new ApiBusinessError('SESSION_EXPIRED', 'QR Code 已過期，請重新整理', 422)
    }
    if (session.status === 'confirmed' && session.result) {
      sessions.delete(req.params.token)
      res.json({ ok: true, data: { status: 'confirmed', ...session.result } })
      return
    }
    res.json({ ok: true, data: { status: 'pending' } })
  } catch (err) {
    next(err)
  }
})

const confirmInput = z.object({ token: z.string().min(1), lineUserId: z.string().min(1) })

// LIFF 頁面呼叫：手機掃碼、LIFF SDK 取得 lineUserId 後，回報後端完成綁定登入。
liffAuthRouter.post('/confirm', async (req, res, next) => {
  try {
    const { token, lineUserId } = confirmInput.parse(req.body)
    const session = sessions.get(token)
    if (!session) throw ApiBusinessError.notFound('Session')
    if (Date.now() > session.expiresAt) {
      sessions.delete(token)
      throw new ApiBusinessError('SESSION_EXPIRED', 'QR Code 已過期，請重新整理', 422)
    }

    const user = await prisma.user.upsert({
      where: { lineUserId },
      update: {},
      create: { lineUserId, botPlatform: 'line' },
    })
    const jwtToken = signToken(user.id)
    session.status = 'confirmed'
    session.result = { token: jwtToken, user }
    res.json({ ok: true, data: { confirmed: true } })
  } catch (err) {
    next(err)
  }
})
