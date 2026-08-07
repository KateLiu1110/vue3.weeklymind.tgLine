export class ApiBusinessError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiBusinessError'
    this.code = code
    this.status = status
  }
}
