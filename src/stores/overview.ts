import { defineStore } from 'pinia'

export interface WeekGoalItem {
  id: string
  title: string
  daysLabel: string
  pct: number
}

export interface Schedule {
  id: string
  day: string
  title: string
  reminded: boolean
}

export interface FocusTask {
  id: string
  title: string
  module: string
  moduleLabel: string
  tagBg: string
  tagCol: string
  progress: number
  due: string
}

export const useOverviewStore = defineStore('overview', {
  state: () => ({
    goalTitle: '我要去海外工作',
    editingGoal: false,
    goalDraft: '',
    weekGoalPct: 62,
    weekGoalLabel: '本週已完成 5 / 8 項打卡',
    weekGoalItems: [
      { id: 'w1', title: '多益備考衝刺', daysLabel: '週一至週五', pct: 62 },
    ] as WeekGoalItem[],
    monthGoalPct: 48,
    monthGoalLabel: '本月已完成 12 / 25 項打卡',
    monthGoalItems: [
      { id: 'm1', title: '作品集網站上線', daysLabel: '7 月目標', pct: 48 },
    ] as WeekGoalItem[],
    calendarMonthOffset: 0,
    schedules: [
      { id: 'sc1', day: '15', title: '多益公開測驗報名截止', reminded: false },
      { id: 'sc2', day: '22', title: '作品集里程碑檢查', reminded: true },
    ] as Schedule[],
    focusTasks: [
      {
        id: 'f1',
        title: '背熟 200 個常用單字',
        module: 'toeic',
        moduleLabel: '多益英文',
        tagBg: 'bg-cream-175',
        tagCol: 'text-clay-500',
        progress: 60,
        due: '2026-07-21',
      },
      {
        id: 'f2',
        title: '繪製台鐵流程線稿圖',
        module: 'portfolio',
        moduleLabel: '作品集',
        tagBg: 'bg-cream-175',
        tagCol: 'text-clay-500',
        progress: 25,
        due: '2026-07-22',
      },
    ] as FocusTask[],
  }),
  actions: {
    startEditGoal() {
      this.editingGoal = true
      this.goalDraft = this.goalTitle
    },
    saveGoal() {
      if (this.goalDraft.trim()) this.goalTitle = this.goalDraft.trim()
      this.editingGoal = false
    },
    deleteSchedule(id: string) {
      this.schedules = this.schedules.filter((s) => s.id !== id)
    },
    toggleReminded(id: string) {
      const s = this.schedules.find((x) => x.id === id)
      if (s) s.reminded = !s.reminded
    },
    deleteFocusTask(id: string) {
      this.focusTasks = this.focusTasks.filter((f) => f.id !== id)
    },
    prevMonth() {
      this.calendarMonthOffset -= 1
    },
    nextMonth() {
      this.calendarMonthOffset += 1
    },
  },
})
