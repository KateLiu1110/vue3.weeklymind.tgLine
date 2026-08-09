import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchUnlockedAchievements } from '@/api/client/achievements'
import { useAuthStore } from '@/stores/auth'

export function useAchievements() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.achievements.all,
    queryFn: fetchUnlockedAchievements,
    enabled: () => auth.isLoggedIn,
  })
}
