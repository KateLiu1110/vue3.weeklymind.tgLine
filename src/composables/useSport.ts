import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import {
  createSportCategory,
  createSportTodo,
  deleteSportCategory,
  deleteSportPage,
  deleteSportTodo,
  fetchSportPage,
  toggleSportTodo,
} from '@/api/client/sport'
import { useAuthStore } from '@/stores/auth'

export function useSportPage() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.sport.all,
    queryFn: fetchSportPage,
    enabled: () => auth.isLoggedIn,
  })
}

export function useSportMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.sport.all })

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createSportCategory(name),
    onSuccess: invalidate,
  })
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteSportCategory(id),
    onSuccess: invalidate,
  })
  const createTodoMutation = useMutation({
    mutationFn: (input: { category: string; name: string }) => createSportTodo(input),
    onSuccess: invalidate,
  })
  const toggleTodoMutation = useMutation({
    mutationFn: (id: string) => toggleSportTodo(id),
    onSuccess: invalidate,
  })
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => deleteSportTodo(id),
    onSuccess: invalidate,
  })
  // 側邊欄「刪除」運動頁面：連帶刪掉驅動這個頁面出現在側邊欄的計畫，所以連 plans
  // 也要一起 invalidate，側邊欄才會馬上跟著消失。
  const deletePageMutation = useMutation({
    mutationFn: () => deleteSportPage(),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })
    },
  })

  return {
    createCategoryMutation,
    deleteCategoryMutation,
    createTodoMutation,
    toggleTodoMutation,
    deleteTodoMutation,
    deletePageMutation,
  }
}
