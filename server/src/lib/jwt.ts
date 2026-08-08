import jwt from 'jsonwebtoken'

const TOKEN_TTL = '30d'

export interface TokenPayload {
  userId: string
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies TokenPayload, getSecret(), { expiresIn: TOKEN_TTL })
}

export function verifyAuthToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getSecret())
  return decoded as TokenPayload
}
