import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { signToken } from '../lib/jwt.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

// LINE Login（server/src/routes/lineLogin.ts）只把 JWT 帶回前端，沒有 user 物件可以
// 一起傳（避免把顯示名稱等資料塞進網址列），前端登入後用這支補拿 user 資料。
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) throw ApiBusinessError.notFound('User')
    res.json({ ok: true, data: user })
  } catch (err) {
    next(err)
  }
})

const THEME_OPTIONS = ['forest', 'ocean', 'starry', 'sakura'] as const
const BOT_LANG_OPTIONS = ['zh', 'en', 'ja'] as const
const preferencesInput = z.object({
  theme: z.enum(THEME_OPTIONS).optional(),
  botLang: z.enum(BOT_LANG_OPTIONS).optional(),
})

// 設定頁「主題色彩」「LINE Bot 語言」都存這裡，登入時 GET /me 會帶回來，前端據此
// 套用 document.documentElement.setAttribute('data-theme', ...)（見 DashboardLayout.vue）。
authRouter.patch('/preferences', requireAuth, async (req, res, next) => {
  try {
    const body = preferencesInput.parse(req.body)
    const user = await prisma.user.update({ where: { id: req.userId }, data: body })
    res.json({ ok: true, data: user })
  } catch (err) {
    next(err)
  }
})

// 登入頁的「新人體驗」按鈕：不用走 LINE OAuth 或簡訊驗證，直接建一個全新、沒有
// phone/lineUserId 的帳號，讓人可以立刻用「全新使用者」的角度看整個 App（訪客模式
// 只能看，這個是真的登入、資料保證是空的）。
authRouter.post('/new-user', async (_req, res, next) => {
  try {
    const user = await prisma.user.create({ data: { displayName: '新朋友' } })
    const token = signToken(user.id)
    res.status(201).json({ ok: true, data: { token, user } })
  } catch (err) {
    next(err)
  }
})

const CODE_TTL_MS = 5 * 60 * 1000

interface PendingCode {
  code: string
  expiresAt: number
}

// Demo-only: no real SMS gateway is wired up (see LOGIN_操作手冊.md). Codes live
// in memory and are "sent" by logging to the server console; the dev response
// also echoes the code back so the login/register pages can show a hint.
const pendingCodes = new Map<string, PendingCode>()

const sendCodeInput = z.object({ phone: z.string().min(1) })
const verifyCodeInput = z.object({
  phone: z.string().min(1),
  code: z.string().min(1),
  displayName: z.string().optional(),
})

authRouter.post('/send-code', (req, res, next) => {
  try {
    const { phone } = sendCodeInput.parse(req.body)
    const code = String(Math.floor(100000 + Math.random() * 900000))
    pendingCodes.set(phone, { code, expiresAt: Date.now() + CODE_TTL_MS })
    console.log(`[SMS mock] 傳送驗證碼 ${code} 給 ${phone}（尚未串接真實電信簡訊 API）`)
    res.json({
      ok: true,
      data: {
        sent: true,
        expiresInSeconds: CODE_TTL_MS / 1000,
        devCode: process.env.NODE_ENV === 'production' ? null : code,
      },
    })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/verify-code', async (req, res, next) => {
  try {
    const { phone, code, displayName } = verifyCodeInput.parse(req.body)
    const pending = pendingCodes.get(phone)
    if (!pending) throw new ApiBusinessError('CODE_NOT_REQUESTED', '請先發送驗證碼', 422)
    if (Date.now() > pending.expiresAt) {
      pendingCodes.delete(phone)
      throw new ApiBusinessError('CODE_EXPIRED', '驗證碼已過期，請重新發送', 422)
    }
    if (pending.code !== code.trim()) {
      throw new ApiBusinessError('CODE_MISMATCH', '驗證碼錯誤', 422)
    }
    pendingCodes.delete(phone)

    // 手機號碼＋驗證碼同時扮演「登入」與「註冊」：第一次出現的號碼就地建立帳號
    // （呼應 LINE 加好友即建帳號的精神），不用另外一個註冊 API。
    const existing = await prisma.user.findUnique({ where: { phone } })
    const user =
      existing ??
      (await prisma.user.create({
        data: { phone, displayName: displayName?.trim() || '' },
      }))

    const token = signToken(user.id)
    res.json({ ok: true, data: { token, user, isNewUser: !existing } })
  } catch (err) {
    next(err)
  }
})
