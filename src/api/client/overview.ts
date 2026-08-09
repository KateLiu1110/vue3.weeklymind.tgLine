import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface ScheduleDto {
  id: string
  day: string
  title: string
  reminded: boolean
}
export interface FocusTaskDto {
  id: string
  title: string
  module: string
  moduleLabel: string
  tagBg: string
  tagCol: string
  progress: number
  due: string
}
export interface GrowthGoalDto {
  id: string
  title: string
  sub: string
  badgeText: string
}
export interface SmallAchievementDto {
  id: string
  text: string
}
export interface OverviewPageDto {
  goalTitle: string
  schedules: ScheduleDto[]
  focusTasks: FocusTaskDto[]
  growthGoals: GrowthGoalDto[]
  achievements: SmallAchievementDto[]
}

export async function fetchOverviewPage(): Promise<OverviewPageDto> {
  const res = await apiClient.get<ApiSuccess<OverviewPageDto>>('/overview')
  return res.data.data
}

export async function updateGoalTitle(goalTitle: string): Promise<{ goalTitle: string }> {
  const res = await apiClient.patch<ApiSuccess<{ goalTitle: string }>>('/overview/goal', { goalTitle })
  return res.data.data
}

export async function createSchedule(input: { day: string; title: string }): Promise<ScheduleDto> {
  const res = await apiClient.post<ApiSuccess<ScheduleDto>>('/overview/schedules', input)
  return res.data.data
}

export async function toggleScheduleReminded(id: string): Promise<ScheduleDto> {
  const res = await apiClient.patch<ApiSuccess<ScheduleDto>>(`/overview/schedules/${id}/toggle-reminded`)
  return res.data.data
}

export async function deleteSchedule(id: string): Promise<void> {
  await apiClient.delete(`/overview/schedules/${id}`)
}

export async function createFocusTask(input: { title: string; module: string; moduleLabel: string; progress: number; due: string }): Promise<FocusTaskDto> {
  const res = await apiClient.post<ApiSuccess<FocusTaskDto>>('/overview/focus-tasks', input)
  return res.data.data
}

export async function deleteFocusTask(id: string): Promise<void> {
  await apiClient.delete(`/overview/focus-tasks/${id}`)
}

export async function createGrowthGoal(input: { title: string; sub: string; badgeText: string }): Promise<GrowthGoalDto> {
  const res = await apiClient.post<ApiSuccess<GrowthGoalDto>>('/overview/growth-goals', input)
  return res.data.data
}

export async function deleteGrowthGoal(id: string): Promise<void> {
  await apiClient.delete(`/overview/growth-goals/${id}`)
}

export async function createAchievement(text: string): Promise<SmallAchievementDto> {
  const res = await apiClient.post<ApiSuccess<SmallAchievementDto>>('/overview/achievements', { text })
  return res.data.data
}

export async function deleteAchievement(id: string): Promise<void> {
  await apiClient.delete(`/overview/achievements/${id}`)
}
