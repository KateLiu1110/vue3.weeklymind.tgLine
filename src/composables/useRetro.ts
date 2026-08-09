import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createRetroGoal, deleteRetroGoal, fetchRetroGoals } from '@/api/client/retro'
import { useAuthStore } from '@/stores/auth'

export function useRetroGoals() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.retro.all,
    queryFn: fetchRetroGoals,
    enabled: () => auth.isLoggedIn,
    retry: false,
  })
}

export function useRetroMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.retro.all })

  const createGoalMutation = useMutation({
    mutationFn: (input: { title: string; start: string; totalDays: number | null; color: string }) => createRetroGoal(input),
    onSuccess: invalidate,
  })
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => deleteRetroGoal(id),
    onSuccess: invalidate,
  })

  return { createGoalMutation, deleteGoalMutation }
}
