import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createExecCategory, deleteExecCategory, fetchExecCategories } from '@/api/client/execCategories'
import { useAuthStore } from '@/stores/auth'

export function useExecCategories() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.execCategories.all,
    queryFn: fetchExecCategories,
    enabled: () => auth.isLoggedIn,
  })
}

export function useExecCategoryMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.execCategories.all })

  const createExecCategoryMutation = useMutation({
    mutationFn: (input: { name: string; value: number; color: string }) => createExecCategory(input),
    onSuccess: invalidate,
  })
  const deleteExecCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteExecCategory(id),
    onSuccess: invalidate,
  })

  return { createExecCategoryMutation, deleteExecCategoryMutation }
}
