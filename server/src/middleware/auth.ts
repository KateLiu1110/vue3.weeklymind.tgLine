import type { NextFunction, Request, Response } from 'express'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { verifyAuthToken } from '../lib/jwt.js'

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) {
    next(new ApiBusinessError('UNAUTHORIZED', '請先登入', 401))
    return
  }
  try {
    const payload = verifyAuthToken(token)
    req.userId = payload.userId
    next()
  } catch {
    next(new ApiBusinessError('UNAUTHORIZED', '登入已過期，請重新登入', 401))
  }
}
