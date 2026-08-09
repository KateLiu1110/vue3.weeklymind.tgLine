import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// 資料本體（分類分頁、待辦清單）改由 useSportPage composable（TanStack Query）提供，
// 這裡只留「目前選到哪個分頁」跟 Modal/表單的 UI 狀態。
export const useSportStore = defineStore('sport', {
  state: () => ({
    activeCategory: '',

    tabAddMode: false,
    tabAddText: '',

    modalOpen: false,
    form: { name: '', category: '' },
    touched: false,
  }),
  actions: {
    setCategory(cat: string) {
      this.activeCategory = cat
    },
    openTabAdd() {
      if (!useAuthStore().requireLogin()) return
      this.tabAddMode = true
      this.tabAddText = ''
    },
    cancelTabAdd() {
      this.tabAddMode = false
    },
    openSportModal() {
      if (!useAuthStore().requireLogin()) return
      this.form = { name: '', category: this.activeCategory }
      this.touched = false
      this.modalOpen = true
    },
    closeSportModal() {
      this.modalOpen = false
    },
  },
})
