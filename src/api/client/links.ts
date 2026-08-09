import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export type LinkPlatform = 'ig' | 'threads' | 'fb' | 'other'

export interface SavedLinkDto {
  id: string
  title: string
  url: string
  platform: LinkPlatform
  category: string
}

export async function fetchLinks(): Promise<SavedLinkDto[]> {
  const res = await apiClient.get<ApiSuccess<SavedLinkDto[]>>('/links')
  return res.data.data
}

export async function createLink(input: { title: string; url: string; category?: string }): Promise<SavedLinkDto> {
  const res = await apiClient.post<ApiSuccess<SavedLinkDto>>('/links', input)
  return res.data.data
}

export async function deleteLink(id: string): Promise<void> {
  await apiClient.delete(`/links/${id}`)
}
