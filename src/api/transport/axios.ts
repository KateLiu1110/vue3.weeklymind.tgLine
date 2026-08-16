import axios from 'axios'
import { getToken } from '@/lib/authToken'
import type { ApiEnvelope } from '@/types/api'
import { ApiBusinessError } from './apiBusinessError'

// 取得環境變數的 Domain，去掉尾部斜杠及可能重複的 /api
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
const cleanDomain = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '')

// 強制統一加上 /api，確保 URL 路徑永遠一致
const baseURL = `${cleanDomain}/api`

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
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
