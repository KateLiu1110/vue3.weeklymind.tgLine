import jwt from 'jsonwebtoken'

const TOKEN_TTL = '30d'
const FALLBACK_JWT_SECRET = 'weeklymind-dev-secret-do-not-use-in-production'

export interface TokenPayload {
  userId: string
}

function getSecret(): string {
  const rawSecret = process.env.JWT_SECRET?.trim()
  const secret = rawSecret && rawSecret.length > 0 ? rawSecret : FALLBACK_JWT_SECRET

  if (!rawSecret) {
    console.warn('[auth] JWT_SECRET is not set; using local fallback for this runtime. Set a real JWT_SECRET in production.')
  }

  return secret
}

export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies TokenPayload, getSecret(), { expiresIn: TOKEN_TTL })
}

export function verifyAuthToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret())
  return decoded as TokenPayload
}
