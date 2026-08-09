import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export async function fetchStreakDays(): Promise<number> {
  const res = await apiClient.get<ApiSuccess<{ streakDays: number }>>('/streak')
  return res.data.data.streakDays
}
