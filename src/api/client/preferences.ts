import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'
import type { AuthUser } from '@/stores/auth'

export async function updatePreferences(input: { theme?: string; botLang?: string }): Promise<AuthUser> {
  const res = await apiClient.patch<ApiSuccess<AuthUser>>('/auth/preferences', input)
  return res.data.data
}
