import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export interface CategoryShare {
  id: string
  name: string
  value: number
  color: string
}

const PALETTE = ['#33513f', '#c9a876', '#2f6bd8', '#b08968']

// goals 資料本體改由 useRetroGoals composable（TanStack Query）提供；weekBars/categoryShares
// 這兩組圖表資料還沒有對應的打卡分類統計後端，先保留成本頁固定的示意資料。
export const useRetroStore = defineStore('retro', {
  state: () => ({
    weekBars: [
      { label: '一', h: 62, active: false },
      { label: '二', h: 88, active: true },
      { label: '三', h: 80, active: true },
      { label: '四', h: 95, active: true },
      { label: '五', h: 100, active: true },
      { label: '六', h: 35, active: false },
      { label: '日', h: 24, active: false },
    ],
    categoryShares: [
      { id: 'cs1', name: '運動', value: 32, color: '#33513f' },
      { id: 'cs2', name: '多益英文', value: 28, color: '#c9a876' },
      { id: 'cs3', name: '作品集', value: 22, color: '#2f6bd8' },
      { id: 'cs4', name: '生活雜項', value: 18, color: '#b08968' },
    ] as CategoryShare[],

    retroGoalModalOpen: false,
    retroGoalForm: { title: '', start: '', totalDays: '' },
    retroGoalTouched: false,
  }),
  getters: {
    pieTotalPct(): number {
      const sum = this.categoryShares.reduce((acc, c) => acc + c.value, 0)
      return sum > 0 ? Math.round(sum / this.categoryShares.length) : 0
    },
  },
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
