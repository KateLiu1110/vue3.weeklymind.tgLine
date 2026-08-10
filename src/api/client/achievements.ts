import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export const ACHIEVEMENT_KEYS = {
  links: 'links_unlocked',
  retro: 'retro_unlocked',
  theme: 'theme_unlocked',
} as const

export async function fetchUnlockedAchievements(): Promise<string[]> {
  const res = await apiClient.get<ApiSuccess<{ unlocked: string[] }>>('/achievements')
  return res.data.data.unlocked
}
