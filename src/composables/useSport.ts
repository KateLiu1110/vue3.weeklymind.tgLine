import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import {
  createSportCategory,
  createSportTodo,
  deleteSportCategory,
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

  return { createCategoryMutation, deleteCategoryMutation, createTodoMutation, toggleTodoMutation, deleteTodoMutation }
}
