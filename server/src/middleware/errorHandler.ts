import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiBusinessError) {
    res.status(err.status).json({ ok: false, code: err.code, message: err.message })
    return
  }
  if (err instanceof ZodError) {
    res.status(422).json({ ok: false, code: 'VALIDATION_ERROR', message: err.issues.map((i) => i.message).join('; ') })
    return
  }
  console.error(err)
  res.status(500).json({ ok: false, code: 'INTERNAL_ERROR', message: 'Internal server error' })
}
