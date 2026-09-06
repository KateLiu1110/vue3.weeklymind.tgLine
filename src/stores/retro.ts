import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const PALETTE = ['#33513f', '#c9a876', '#2f6bd8', '#b08968']

// goals 資料本體改由 useRetroGoals composable（TanStack Query）提供；本週達成率變化／
// 各分類達成率佔比改由 useRetroSummary composable 提供（見 RetroView.vue），這個 store
// 現在只留 Modal/表單的 UI 狀態。
export const useRetroStore = defineStore('retro', {
  state: () => ({
    retroGoalModalOpen: false,
    retroGoalForm: { title: '', start: '', totalDays: '' },
    retroGoalTouched: false,
  }),
  actions: {
    openRetroGoalModal() {
      if (!useAuthStore().requireLogin()) return
      this.retroGoalForm = { title: '', start: '', totalDays: '' }
      this.retroGoalTouched = false
      this.retroGoalModalOpen = true
    },
    closeRetroGoalModal() {
      this.retroGoalModalOpen = false
    },
    nextColor(existingCount: number): string {
      return PALETTE[existingCount % PALETTE.length]!
    },
  },
})
