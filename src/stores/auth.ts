import { defineStore } from 'pinia'
import { clearToken, getToken, setToken } from '@/lib/authToken'

export interface AuthUser {
  id: string
  phone: string | null
  lineUserId: string | null
  displayName: string
  avatarUrl: string | null
  botPlatform: string
  botLang: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken() as string | null,
    user: null as AuthUser | null,
  }),
  getters: {
    isLoggedIn(state): boolean {
      return !!state.token
    },
  },
  actions: {
    setSession(user: AuthUser, token: string) {
      this.user = user
      this.token = token
      setToken(token)
    },
    logout() {
      this.user = null
      this.token = null
      clearToken()
    },
  },
})
