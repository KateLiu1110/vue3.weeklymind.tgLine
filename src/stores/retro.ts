import { defineStore } from 'pinia'

export interface RetroGoal {
  id: string
  title: string
  label: string
  pct: number
  color: string
}

export interface CategoryShare {
  id: string
  name: string
  value: number
  color: string
}

export const useRetroStore = defineStore('retro', {
  state: () => ({
    goals: [
      { id: 'rg1', title: '多益 600 分', label: '58%', pct: 58, color: '#c9a876' },
      { id: 'rg2', title: '作品集初版', label: '42%', pct: 42, color: '#33513f' },
      { id: 'rg3', title: '前端知識累積', label: '第 6 週', pct: 70, color: '#2f6bd8' },
    ] as RetroGoal[],
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
  }),
  getters: {
    pieTotalPct(): number {
      const sum = this.categoryShares.reduce((acc, c) => acc + c.value, 0)
      return sum > 0 ? Math.round(sum / this.categoryShares.length) : 0
    },
  },
  actions: {
    deleteGoal(id: string) {
      this.goals = this.goals.filter((g) => g.id !== id)
    },
  },
})
