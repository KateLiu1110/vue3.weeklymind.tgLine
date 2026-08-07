export class ApiBusinessError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.name = 'ApiBusinessError'
    this.code = code
    this.status = status
  }

  static notFound(resource: string) {
    return new ApiBusinessError('NOT_FOUND', `${resource} not found`, 404)
  }

  static validation(message: string) {
    return new ApiBusinessError('VALIDATION_ERROR', message, 422)
  }
}
