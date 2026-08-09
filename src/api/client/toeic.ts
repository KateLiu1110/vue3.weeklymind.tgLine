import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface ToeicProfileDto {
  goalTitle: string
  goalDesc: string
  classSchedule: string
  lastMockScore: number
  targetScore: number
  scoreTrend: { label: string; h: number; highlight: boolean }[]
}
export interface ToeicExamDateDto {
  id: string
  title: string
  date: string
}
export interface ToeicTaskItemDto {
  id: string
  title: string
  iconKey: string
  todayLabel: string
  pct: number
  done: boolean
}
export interface ToeicPageDto {
  profile: ToeicProfileDto
  examDates: ToeicExamDateDto[]
  tasks: ToeicTaskItemDto[]
}

export async function fetchToeicPage(): Promise<ToeicPageDto> {
  const res = await apiClient.get<ApiSuccess<ToeicPageDto>>('/toeic')
  return res.data.data
}

export async function updateToeicProfile(input: Partial<ToeicProfileDto>): Promise<ToeicProfileDto> {
  const res = await apiClient.patch<ApiSuccess<ToeicProfileDto>>('/toeic/profile', input)
  return res.data.data
}

export async function createToeicExamDate(input: { title: string; date: string }): Promise<ToeicExamDateDto> {
  const res = await apiClient.post<ApiSuccess<ToeicExamDateDto>>('/toeic/exam-dates', input)
  return res.data.data
}

export async function deleteToeicExamDate(id: string): Promise<void> {
  await apiClient.delete(`/toeic/exam-dates/${id}`)
}

export async function createToeicTask(input: {
  title: string
  iconKey?: string
  todayLabel?: string
  pct?: number
}): Promise<ToeicTaskItemDto> {
  const res = await apiClient.post<ApiSuccess<ToeicTaskItemDto>>('/toeic/tasks', input)
  return res.data.data
}

export async function updateToeicTask(
  id: string,
  input: Partial<{ title: string; todayLabel: string; pct: number; done: boolean }>,
): Promise<ToeicTaskItemDto> {
  const res = await apiClient.patch<ApiSuccess<ToeicTaskItemDto>>(`/toeic/tasks/${id}`, input)
  return res.data.data
}

export async function deleteToeicTask(id: string): Promise<void> {
  await apiClient.delete(`/toeic/tasks/${id}`)
}
