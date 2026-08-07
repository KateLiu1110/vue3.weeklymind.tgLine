import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createPlan, deletePlan, fetchPlans, updatePlan } from '@/api/client/plans'
import type { PlanCreateInput, PlanUpdateInput } from '@/types/api'

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: fetchPlans,
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

  return { createPlanMutation, updatePlanMutation, deletePlanMutation }
}
