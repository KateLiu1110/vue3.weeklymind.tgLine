import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchCustomModules } from '@/api/client/customModules'
import { useAuthStore } from '@/stores/auth'

export function useCustomModules() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.customModules.all,
    queryFn: fetchCustomModules,
    enabled: () => auth.isLoggedIn,
  })
}
