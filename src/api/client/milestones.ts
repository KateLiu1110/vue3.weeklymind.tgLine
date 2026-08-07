import { apiClient } from '@/api/transport/axios'
import type { Milestone } from '@/stores/core'
import type { ApiSuccess, MilestoneCreateInput, MilestoneUpdateInput } from '@/types/api'

export async function fetchMilestones(): Promise<Milestone[]> {
  const res = await apiClient.get<ApiSuccess<Milestone[]>>('/milestones')
  return res.data.data
}

export async function createMilestone(input: MilestoneCreateInput): Promise<Milestone> {
  const res = await apiClient.post<ApiSuccess<Milestone>>('/milestones', input)
  return res.data.data
}

export async function updateMilestone(id: string, input: MilestoneUpdateInput): Promise<Milestone> {
  const res = await apiClient.patch<ApiSuccess<Milestone>>(`/milestones/${id}`, input)
  return res.data.data
}

export async function deleteMilestone(id: string): Promise<void> {
  await apiClient.delete(`/milestones/${id}`)
}
