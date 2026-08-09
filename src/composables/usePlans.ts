import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { checkinPlan, createPlan, deletePlan, fetchPlans, updatePlan } from '@/api/client/plans'
import { useAuthStore } from '@/stores/auth'
import type { PlanCreateInput, PlanUpdateInput } from '@/types/api'

export function usePlans() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: fetchPlans,
    // 訪客沒有 token，這支 API 一定回 401——乾脆不要打，讓畫面直接呈現空狀態。
    enabled: () => auth.isLoggedIn,
  })
}

export function usePlanMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })

  const createPlanMutation = useMutation({
    mutationFn: (input: PlanCreateInput) => createPlan(input),
    onSuccess: invalidate,
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanUpdateInput }) => updatePlan(id, input),
    onSuccess: invalidate,
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: invalidate,
  })

  const checkinPlanMutation = useMutation({
    mutationFn: (id: string) => checkinPlan(id),
    onSuccess: () => {
      invalidate()
      // 打卡次數會影響覆盤中心的解鎖條件，順便讓側邊欄鎖定狀態跟著更新。
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all })
    },
  })

  return { createPlanMutation, updatePlanMutation, deletePlanMutation, checkinPlanMutation }
}
