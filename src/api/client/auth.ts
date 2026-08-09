import { apiClient } from '@/api/transport/axios'
import type { AuthUser } from '@/stores/auth'
import type { ApiSuccess } from '@/types/api'

// LINE Login OAuth callback 只帶回 JWT（見 server/src/routes/lineLogin.ts），
// 登入頁把 token 存好之後用這支補拿使用者資料。
export async function fetchMe(): Promise<AuthUser> {
  const res = await apiClient.get<ApiSuccess<AuthUser>>('/auth/me')
  return res.data.data
}

// 登入頁「新人體驗」按鈕：建一個全新、保證沒有任何資料的帳號並直接登入。
export async function createNewUser(): Promise<{ token: string; user: AuthUser }> {
  const res = await apiClient.post<ApiSuccess<{ token: string; user: AuthUser }>>('/auth/new-user')
  return res.data.data
}
