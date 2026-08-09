import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import {
  createToeicExamDate,
  createToeicTask,
  deleteToeicExamDate,
  deleteToeicPage,
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
  // 側邊欄「刪除」多益英文頁面：連帶刪掉驅動這個頁面出現在側邊欄的計畫，所以連 plans
  // 也要一起 invalidate，側邊欄才會馬上跟著消失。
  const deletePageMutation = useMutation({
    mutationFn: () => deleteToeicPage(),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })
    },
  })

  return {
    updateProfileMutation,
    createExamDateMutation,
    deleteExamDateMutation,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    deletePageMutation,
  }
}
