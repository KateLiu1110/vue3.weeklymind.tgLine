import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface ProjectDto {
  id: string
  name: string
  caption: string
  status: 'todo' | 'doing' | 'done'
  dailyPct: number
}

export async function fetchProjects(): Promise<ProjectDto[]> {
  const res = await apiClient.get<ApiSuccess<ProjectDto[]>>('/portfolio')
  return res.data.data
}

export async function createProject(input: { name: string; caption?: string }): Promise<ProjectDto> {
  const res = await apiClient.post<ApiSuccess<ProjectDto>>('/portfolio', input)
  return res.data.data
}

export async function updateProject(
  id: string,
  input: Partial<{ name: string; caption: string; status: ProjectDto['status'] }>,
): Promise<ProjectDto> {
  const res = await apiClient.patch<ApiSuccess<ProjectDto>>(`/portfolio/${id}`, input)
  return res.data.data
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/portfolio/${id}`)
}

// 側邊欄「刪除」作品集看板頁面：整頁資料 + 驅動這個頁面出現在側邊欄的計畫一起刪掉。
export async function deletePortfolioPage(): Promise<void> {
  await apiClient.delete('/portfolio')
}
