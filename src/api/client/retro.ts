import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface RetroGoalDto {
  id: string
  title: string
  start: string
  totalDays: number | null
  color: string
}

export async function fetchRetroGoals(): Promise<RetroGoalDto[]> {
  const res = await apiClient.get<ApiSuccess<RetroGoalDto[]>>('/retro')
  return res.data.data
}

export async function createRetroGoal(input: {
  title: string
  start: string
  totalDays: number | null
  color: string
}): Promise<RetroGoalDto> {
  const res = await apiClient.post<ApiSuccess<RetroGoalDto>>('/retro', input)
  return res.data.data
}

export async function deleteRetroGoal(id: string): Promise<void> {
  await apiClient.delete(`/retro/${id}`)
}
