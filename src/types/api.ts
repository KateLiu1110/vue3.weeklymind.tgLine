import type { Milestone, Plan } from '@/stores/core'

export interface ApiSuccess<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  code: string
  message: string
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError

export type PlanCreateInput = Omit<Plan, 'id'>
export type PlanUpdateInput = Partial<PlanCreateInput>

export type MilestoneCreateInput = Omit<Milestone, 'id'>
export type MilestoneUpdateInput = Partial<MilestoneCreateInput>
