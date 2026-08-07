import axios from 'axios'
import type { ApiEnvelope } from '@/types/api'
import { ApiBusinessError } from './apiBusinessError'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope<unknown>
    if (body && typeof body === 'object' && 'ok' in body && body.ok === false) {
      throw new ApiBusinessError(body.code, body.message, response.status)
    }
    return response
  },
  (error) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data as ApiEnvelope<unknown> | undefined
    if (body && 'ok' in body && body.ok === false) {
      throw new ApiBusinessError(body.code, body.message, status)
    }
    throw new ApiBusinessError('NETWORK_ERROR', error.message ?? 'Network error', status)
  },
)
