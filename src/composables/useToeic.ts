import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import {
  createToeicExamDate,
  createToeicTask,
  deleteToeicExamDate,
  deleteToeicTask,
  fetchToeicPage,
  updateToeicProfile,
  updateToeicTask,
  type ToeicProfileDto,
} from '@/api/client/toeic'
import { useAuthStore } from '@/stores/auth'

export function useToeicPage() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.toeic.all,
    queryFn: fetchToeicPage,
    enabled: () => auth.isLoggedIn,
  })
}

export function useToeicMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.toeic.all })

  const updateProfileMutation = useMutation({
    mutationFn: (input: Partial<ToeicProfileDto>) => updateToeicProfile(input),
    onSuccess: invalidate,
  })
  const createExamDateMutation = useMutation({
    mutationFn: (input: { title: string; date: string }) => createToeicExamDate(input),
    onSuccess: invalidate,
  })
  const deleteExamDateMutation = useMutation({
    mutationFn: (id: string) => deleteToeicExamDate(id),
    onSuccess: invalidate,
  })
  const createTaskMutation = useMutation({
    mutationFn: (input: { title: string; iconKey?: string; todayLabel?: string; pct?: number }) => createToeicTask(input),
    onSuccess: invalidate,
  })
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ title: string; todayLabel: string; pct: number; done: boolean }> }) =>
      updateToeicTask(id, input),
    onSuccess: invalidate,
  })
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteToeicTask(id),
    onSuccess: invalidate,
  })

  return {
    updateProfileMutation,
    createExamDateMutation,
    deleteExamDateMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  }
}
