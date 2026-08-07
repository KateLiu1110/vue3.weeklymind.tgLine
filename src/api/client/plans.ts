import { apiClient } from '@/api/transport/axios'
import type { Plan } from '@/stores/core'
import type { ApiSuccess, PlanCreateInput, PlanUpdateInput } from '@/types/api'

export async function fetchPlans(): Promise<Plan[]> {
  const res = await apiClient.get<ApiSuccess<Plan[]>>('/plans')
  return res.data.data
}

export async function createPlan(input: PlanCreateInput): Promise<Plan> {
  const res = await apiClient.post<ApiSuccess<Plan>>('/plans', input)
  return res.data.data
}

export async function updatePlan(id: string, input: PlanUpdateInput): Promise<Plan> {
  const res = await apiClient.patch<ApiSuccess<Plan>>(`/plans/${id}`, input)
  return res.data.data
}

export async function deletePlan(id: string): Promise<void> {
  await apiClient.delete(`/plans/${id}`)
}
