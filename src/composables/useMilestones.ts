import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createMilestone, deleteMilestone, fetchMilestones, updateMilestone } from '@/api/client/milestones'
import { useAuthStore } from '@/stores/auth'
import type { MilestoneCreateInput, MilestoneUpdateInput } from '@/types/api'

export function useMilestones() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.milestones.all,
    queryFn: fetchMilestones,
    enabled: () => auth.isLoggedIn,
  })
}

export function useMilestoneMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.milestones.all })

  const createMilestoneMutation = useMutation({
    mutationFn: (input: MilestoneCreateInput) => createMilestone(input),
    onSuccess: invalidate,
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: MilestoneUpdateInput }) => updateMilestone(id, input),
    onSuccess: invalidate,
  })

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: invalidate,
  })

  return { createMilestoneMutation, updateMilestoneMutation, deleteMilestoneMutation }
}
