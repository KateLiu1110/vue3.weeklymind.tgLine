import { defineStore } from 'pinia'

export interface DayCell {
  label: string
  date: string
  done: boolean
  isToday: boolean
}

export interface TodayTask {
  id: string
  title: string
  done: boolean
}

export interface RadarSkill {
  label: string
  value: number
}

export interface StageBar {
  label: string
  h: number
  active: boolean
}

export interface CategoryProgress {
  id: string
  name: string
  value: number
  color: string
  auto: boolean
}

export const useExecStore = defineStore('exec', {
  state: () => ({
    weekNumber: 3,
    weekDays: [
      { label: '一', date: '7/6', done: true, isToday: false },
      { label: '二', date: '7/7', done: true, isToday: false },
      { label: '三', date: '7/8', done: false, isToday: true },
      { label: '四', date: '7/9', done: false, isToday: false },
      { label: '五', date: '7/10', done: false, isToday: false },
      { label: '六', date: '7/11', done: false, isToday: false },
      { label: '日', date: '7/12', done: false, isToday: false },
    ] as DayCell[],
    todayTasks: [
      { id: 't1', title: '間歇跑訓練 5km', done: false },
      { id: 't2', title: '《原子習慣》閱讀 30 頁', done: false },
      { id: 't3', title: '背 20 個多益單字', done: true },
    ] as TodayTask[],
    radarSkills: [
      { label: '運動', value: 78 },
      { label: '英文', value: 62 },
      { label: '作品集', value: 45 },
      { label: '生活', value: 55 },
    ] as RadarSkill[],
    stageBars: [
      { label: '一', h: 40, active: true },
      { label: '二', h: 60, active: true },
      { label: '三', h: 30, active: false },
      { label: '四', h: 0, active: false },
      { label: '五', h: 0, active: false },
      { label: '六', h: 0, active: false },
      { label: '日', h: 0, active: false },
    ] as StageBar[],
    scheduledCount: 9,
    checkedGoalsCount: 5,
    catProgress: [
      { id: 'c1', name: '運動', value: 70, color: '#33513f', auto: true },
      { id: 'c2', name: '多益英文', value: 62, color: '#c9a876', auto: true },
      { id: 'c3', name: '作品集', value: 45, color: '#2f6bd8', auto: true },
      { id: 'c4', name: '生活雜項', value: 55, color: '#b08968', auto: false },
    ] as CategoryProgress[],

    execCatModalOpen: false,
    execCatForm: { name: '', value: '0' },
    execCatTouched: false,

    monthlyReportOpen: false,
  }),
  actions: {
    toggleTask(id: string) {
      const t = this.todayTasks.find((x) => x.id === id)
      if (t) t.done = !t.done
    },
    removeCategory(id: string) {
      this.catProgress = this.catProgress.filter((c) => c.id !== id)
    },
    openExecCatModal() {
      this.execCatForm = { name: '', value: '0' }
      this.execCatTouched = false
      this.execCatModalOpen = true
    },
    closeExecCatModal() {
      this.execCatModalOpen = false
    },
    saveExecCat() {
      if (!this.execCatForm.name.trim()) {
        this.execCatTouched = true
        return
      }
      const palette = ['#33513f', '#c9a876', '#2f6bd8', '#b08968']
      this.catProgress.push({
        id: 'c' + Date.now(),
        name: this.execCatForm.name.trim(),
        value: Number(this.execCatForm.value) || 0,
        color: palette[this.catProgress.length % palette.length],
        auto: false,
      })
      this.execCatModalOpen = false
    },
    openMonthlyReport() {
      this.monthlyReportOpen = true
    },
    closeMonthlyReport() {
      this.monthlyReportOpen = false
    },
  },
})
