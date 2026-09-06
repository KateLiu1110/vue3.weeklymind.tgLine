import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createRetroGoal, deleteRetroGoal, fetchRetroGoals, fetchRetroSummary } from '@/api/client/retro'
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

// 本週達成率變化／各分類達成率佔比：跟 goals 是同一個解鎖條件（見 server/src/routes/retro.ts
// 的 requireUnlocked），但資料形狀不同，分開查詢；用同一個 queryKeys.retro.all 當基底
// 讓兩份查詢在解鎖/新增目標時可以一起被 invalidate。
export function useRetroSummary() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: [...queryKeys.retro.all, 'summary'],
    queryFn: fetchRetroSummary,
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
