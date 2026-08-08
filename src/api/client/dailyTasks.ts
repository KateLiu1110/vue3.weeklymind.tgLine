import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface DailyTaskDto {
  id: string
  category: string
  title: string
  source: string
  completedAt: string | null
  createdAt: string
}

export async function fetchDailyTasks(): Promise<DailyTaskDto[]> {
  const res = await apiClient.get<ApiSuccess<DailyTaskDto[]>>('/daily-tasks')
  return res.data.data
}

export async function createDailyTask(title: string): Promise<DailyTaskDto> {
  const res = await apiClient.post<ApiSuccess<DailyTaskDto>>('/daily-tasks', { title, category: '待辦' })
  return res.data.data
}

export async function toggleDailyTask(id: string): Promise<DailyTaskDto> {
  const res = await apiClient.patch<ApiSuccess<DailyTaskDto>>(`/daily-tasks/${id}/toggle`)
  return res.data.data
}

export async function deleteDailyTask(id: string): Promise<void> {
  await apiClient.delete(`/daily-tasks/${id}`)
}
