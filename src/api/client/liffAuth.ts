import { apiClient } from '@/api/transport/axios'
import type { AuthUser } from '@/stores/auth'
import type { ApiSuccess } from '@/types/api'

export interface LiffSessionResult {
  token: string
  expiresInSeconds: number
  liffUrl: string | null
}

export type LiffPollResult = { status: 'pending' } | { status: 'confirmed'; token: string; user: AuthUser }

export async function createLiffSession(): Promise<LiffSessionResult> {
  const res = await apiClient.post<ApiSuccess<LiffSessionResult>>('/liff/session')
  return res.data.data
}

export async function pollLiffSession(token: string): Promise<LiffPollResult> {
  const res = await apiClient.get<ApiSuccess<LiffPollResult>>(`/liff/session/${token}`)
  return res.data.data
}

export async function confirmLiffLogin(token: string, lineUserId: string): Promise<void> {
  await apiClient.post('/liff/confirm', { token, lineUserId })
}
