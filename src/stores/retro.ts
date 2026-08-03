import { defineStore } from 'pinia'
import dayjs from 'dayjs'

export interface RetroGoal {
  id: string
  title: string
  start: string
  totalDays: number | null
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
      { id: 'rg1', title: '多益 600 分', start: '2026-05-30', totalDays: 90, color: '#c9a876' },
      { id: 'rg2', title: '作品集初版', start: '2026-06-26', totalDays: 60, color: '#33513f' },
      { id: 'rg3', title: '前端知識累積', start: '2026-06-19', totalDays: null, color: '#2f6bd8' },
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

    retroGoalModalOpen: false,
    retroGoalForm: { title: '', start: '', totalDays: '' },
    retroGoalTouched: false,
  }),
  getters: {
    pieTotalPct(): number {
      const sum = this.categoryShares.reduce((acc, c) => acc + c.value, 0)
      return sum > 0 ? Math.round(sum / this.categoryShares.length) : 0
    },
    goalsDisplay(state) {
      return state.goals.map((g) => {
        const elapsedDays = Math.max(dayjs().diff(dayjs(g.start), 'day'), 0)
        if (g.totalDays) {
          const pct = Math.min(100, Math.round((elapsedDays / g.totalDays) * 100))
          return { ...g, pct, label: `${pct}%` }
        }
        const week = Math.floor(elapsedDays / 7) + 1
        return { ...g, pct: Math.min(100, Math.round((elapsedDays / (52 * 7)) * 100)), label: `第 ${week} 週` }
      })
    },
  },
  actions: {
    deleteGoal(id: string) {
      this.goals = this.goals.filter((g) => g.id !== id)
    },
    openRetroGoalModal() {
      this.retroGoalForm = { title: '', start: '', totalDays: '' }
      this.retroGoalTouched = false
      this.retroGoalModalOpen = true
    },
    closeRetroGoalModal() {
      this.retroGoalModalOpen = false
    },
    saveRetroGoal() {
      if (!this.retroGoalForm.title.trim() || !this.retroGoalForm.start) {
        this.retroGoalTouched = true
        return
      }
      const palette = ['#33513f', '#c9a876', '#2f6bd8', '#b08968']
      this.goals.push({
        id: 'rg' + Date.now(),
        title: this.retroGoalForm.title.trim(),
        start: this.retroGoalForm.start,
        totalDays: this.retroGoalForm.totalDays ? Number(this.retroGoalForm.totalDays) : null,
        color: palette[this.goals.length % palette.length],
      })
      this.retroGoalModalOpen = false
    },
  },
})
