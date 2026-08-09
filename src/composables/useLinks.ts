import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createLink, deleteLink, fetchLinks } from '@/api/client/links'
import { useAuthStore } from '@/stores/auth'

export function useLinks() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.links.all,
    queryFn: fetchLinks,
    enabled: () => auth.isLoggedIn,
    retry: false,
  })
}

export function useLinkMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.links.all })

  const createLinkMutation = useMutation({
    mutationFn: (input: { title: string; url: string; category?: string }) => createLink(input),
    onSuccess: invalidate,
  })
  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onSuccess: invalidate,
  })

  return { createLinkMutation, deleteLinkMutation }
}
