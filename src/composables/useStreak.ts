import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchStreakDays } from '@/api/client/streak'
import { useAuthStore } from '@/stores/auth'

export function useStreak() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.streak.all,
    queryFn: fetchStreakDays,
    enabled: () => auth.isLoggedIn,
  })
}
