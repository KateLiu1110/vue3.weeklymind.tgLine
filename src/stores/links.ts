import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// 資料本體改由 useLinks composable（TanStack Query）提供，這裡只留 Modal/表單的 UI 狀態。
export const useLinksStore = defineStore('links', {
  state: () => ({
    modalOpen: false,
    form: { title: '', url: '', tag: '' },
    touched: false,
  }),
  getters: {
    detectedPlatform(state): { id: 'ig' | 'threads' | 'fb' | 'other'; label: string } {
      const url = state.form.url.toLowerCase()
      if (url.includes('threads')) return { id: 'threads', label: 'Threads' }
      if (url.includes('facebook') || url.includes('fb.com')) return { id: 'fb', label: 'Facebook' }
      if (url.includes('instagram')) return { id: 'ig', label: 'Instagram' }
      return { id: 'other', label: '其他' }
    },
  },
  actions: {
    openLinkModal() {
      if (!useAuthStore().requireLogin()) return
      this.form = { title: '', url: '', tag: '' }
      this.touched = false
      this.modalOpen = true
    },
    closeLinkModal() {
      this.modalOpen = false
    },
  },
})
