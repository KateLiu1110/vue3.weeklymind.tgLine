import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createDailyTask, deleteDailyTask, fetchDailyTasks, toggleDailyTask } from '@/api/client/dailyTasks'
import { useAuthStore } from '@/stores/auth'

export function useDailyTasks() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.dailyTasks.all,
    queryFn: fetchDailyTasks,
    enabled: () => auth.isLoggedIn,
  })
}

export function useDailyTaskMutations() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.dailyTasks.all })

  const createTaskMutation = useMutation({
    mutationFn: (title: string) => {
      if (!auth.requireLogin()) return Promise.reject(new Error('not-logged-in'))
      return createDailyTask(title)
    },
    onSuccess: invalidate,
  })

  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) => toggleDailyTask(id),
    onSuccess: invalidate,
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteDailyTask(id),
    onSuccess: invalidate,
  })

  return { createTaskMutation, toggleTaskMutation, deleteTaskMutation }
}
