import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createDailyTask, deleteDailyTask, fetchDailyTasks, toggleDailyTask } from '@/api/client/dailyTasks'

export function useDailyTasks() {
  return useQuery({
    queryKey: queryKeys.dailyTasks.all,
    queryFn: fetchDailyTasks,
  })
}

export function useDailyTaskMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.dailyTasks.all })

  const createTaskMutation = useMutation({
    mutationFn: (title: string) => createDailyTask(title),
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
