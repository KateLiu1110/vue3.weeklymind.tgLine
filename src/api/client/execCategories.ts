import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface ExecCategoryDto {
  id: string
  name: string
  value: number
  color: string
}

export async function fetchExecCategories(): Promise<ExecCategoryDto[]> {
  const res = await apiClient.get<ApiSuccess<ExecCategoryDto[]>>('/exec-categories')
  return res.data.data
}

export async function createExecCategory(input: { name: string; value: number; color: string }): Promise<ExecCategoryDto> {
  const res = await apiClient.post<ApiSuccess<ExecCategoryDto>>('/exec-categories', input)
  return res.data.data
}

export async function deleteExecCategory(id: string): Promise<void> {
  await apiClient.delete(`/exec-categories/${id}`)
}
