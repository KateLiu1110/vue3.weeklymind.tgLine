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
  theme: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken() as string | null,
    user: null as AuthUser | null,
    // 訪客可以瀏覽 /app/* 觀摩畫面，但一旦嘗試新增/刪除等動作就會跳這個提示。
    loginPromptOpen: false,
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
    promptLogin() {
      this.loginPromptOpen = true
    },
    closeLoginPrompt() {
      this.loginPromptOpen = false
    },
    /** 訪客動作守門員：已登入回傳 true 放行；未登入跳出登入提示並回傳 false。 */
    requireLogin(): boolean {
      if (this.isLoggedIn) return true
      this.promptLogin()
      return false
    },
  },
})
