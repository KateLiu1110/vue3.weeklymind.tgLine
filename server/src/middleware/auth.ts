import type { NextFunction, Request, Response } from 'express'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { verifyAuthToken } from '../lib/jwt.js'
import { getUnlockedKeys } from '../lib/achievements.js'

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

/** 掛在 requireAuth 之後：這個工具還沒解鎖就擋掉，跟側邊欄鎖定 UI 是同一組判斷（見 lib/achievements.ts）。 */
export function requireUnlocked(key: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const keys = await getUnlockedKeys(req.userId)
    if (!keys.includes(key)) {
      next(new ApiBusinessError('FEATURE_LOCKED', '這個功能還沒解鎖', 403))
      return
    }
    next()
  }
}
