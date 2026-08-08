import { Router } from 'express'
import { prisma } from '../db.js'
import { signToken } from '../lib/jwt.js'

export const lineLoginRouter = Router()

const STATE_TTL_MS = 5 * 60 * 1000
const pendingStates = new Map<string, number>() // state -> expiresAt

function randomState(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

function isConfigured(): boolean {
  return !!(process.env.LINE_LOGIN_CHANNEL_ID && process.env.LINE_LOGIN_CHANNEL_SECRET)
}

const frontendOrigin = () => process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

// 使用者點「使用 LINE 帳號登入」→ 導向這裡 → 轉去 LINE 官方授權頁面。
lineLoginRouter.get('/login', (_req, res) => {
  if (!isConfigured()) {
    res.redirect(`${frontendOrigin()}/login?error=line_login_not_configured`)
    return
  }
  const state = randomState()
  pendingStates.set(state, Date.now() + STATE_TTL_MS)

  const authorizeUrl = new URL('https://access.line.me/oauth2/v2.1/authorize')
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', process.env.LINE_LOGIN_CHANNEL_ID!)
  authorizeUrl.searchParams.set('redirect_uri', process.env.LINE_LOGIN_REDIRECT_URI!)
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('scope', 'profile openid')

  res.redirect(authorizeUrl.toString())
})

// LINE 授權完成後導回這裡：用 code 換 access token → 拿 profile → upsert 帳號 → 發 JWT →
// 導回前端（帶著 JWT，前端頁面讀完就從網址列拿掉，避免留在瀏覽器歷史紀錄裡）。
lineLoginRouter.get('/callback', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : null
  const state = typeof req.query.state === 'string' ? req.query.state : null

  const expiresAt = state ? pendingStates.get(state) : undefined
  if (state) pendingStates.delete(state)

  if (!code || !state || !expiresAt || Date.now() > expiresAt) {
    res.redirect(`${frontendOrigin()}/login?error=line_login_failed`)
    return
  }

  try {
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINE_LOGIN_REDIRECT_URI!,
        client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
        client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
      }),
    })
    if (!tokenRes.ok) throw new Error(`token exchange failed: ${tokenRes.status}`)
    const { access_token } = (await tokenRes.json()) as { access_token: string }

    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!profileRes.ok) throw new Error(`profile fetch failed: ${profileRes.status}`)
    const profile = (await profileRes.json()) as { userId: string; displayName: string; pictureUrl?: string }

    const user = await prisma.user.upsert({
      where: { lineUserId: profile.userId },
      update: { displayName: profile.displayName, avatarUrl: profile.pictureUrl },
      create: {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl,
        botPlatform: 'line',
      },
    })

    const jwt = signToken(user.id)
    res.redirect(`${frontendOrigin()}/login/line-callback?token=${encodeURIComponent(jwt)}`)
  } catch (err) {
    console.error('[line-login] callback failed', err)
    res.redirect(`${frontendOrigin()}/login?error=line_login_failed`)
  }
})
