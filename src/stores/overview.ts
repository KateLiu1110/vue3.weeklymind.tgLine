import { defineStore } from 'pinia'

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

export interface GrowthGoal {
  id: string
  title: string
  sub: string
  badgeText: string
}

export interface Achievement {
  id: string
  text: string
}

export const useOverviewStore = defineStore('overview', {
  state: () => ({
    goalTitle: '我要去海外工作',
    editingGoal: false,
    goalDraft: '',
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

    focusModalOpen: false,
    focusForm: { title: '', module: '', progress: '0', due: '' },
    focusTouched: false,

    scheduleModalOpen: false,
    allSchedulesModalOpen: false,
    scheduleForm: { date: '', title: '', repeat: 'once' as 'once' | 'weekly', weekday: '1' },
    scheduleTouched: false,

    allFocusTasksModalOpen: false,

    goalDetailModalOpen: false,
    goalDetailScope: 'week' as 'week' | 'month',

    growthGoals: [] as GrowthGoal[],
    growthGoalModalOpen: false,
    growthGoalForm: { title: '', sub: '', badgeText: '' },
    growthGoalTouched: false,

    achievements: [] as Achievement[],
    achievementModalOpen: false,
    achievementForm: { text: '' },
    achievementTouched: false,
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

    openFocusTaskModal() {
      this.focusForm = { title: '', module: '', progress: '0', due: '' }
      this.focusTouched = false
      this.focusModalOpen = true
    },
    closeFocusTaskModal() {
      this.focusModalOpen = false
    },
    saveFocusTask() {
      if (!this.focusForm.title.trim()) {
        this.focusTouched = true
        return
      }
      this.focusTasks.push({
        id: 'f' + Date.now(),
        title: this.focusForm.title.trim(),
        module: this.focusForm.module || 'overview',
        moduleLabel: this.focusForm.module || '計畫中心',
        tagBg: 'bg-cream-175',
        tagCol: 'text-clay-500',
        progress: Number(this.focusForm.progress) || 0,
        due: this.focusForm.due,
      })
      this.focusModalOpen = false
    },
    openAllFocusTasks() {
      this.allFocusTasksModalOpen = true
    },
    closeAllFocusTasks() {
      this.allFocusTasksModalOpen = false
    },

    openScheduleModal() {
      this.scheduleForm = { date: '', title: '', repeat: 'once', weekday: '1' }
      this.scheduleTouched = false
      this.scheduleModalOpen = true
    },
    closeScheduleModal() {
      this.scheduleModalOpen = false
    },
    saveSchedule() {
      const valid =
        this.scheduleForm.title.trim() && (this.scheduleForm.repeat === 'weekly' || this.scheduleForm.date)
      if (!valid) {
        this.scheduleTouched = true
        return
      }
      const day =
        this.scheduleForm.repeat === 'weekly'
          ? '每' + ['日', '一', '二', '三', '四', '五', '六'][Number(this.scheduleForm.weekday)]
          : (this.scheduleForm.date.split('-')[2] ?? this.scheduleForm.date)
      this.schedules.push({ id: 'sc' + Date.now(), day, title: this.scheduleForm.title.trim(), reminded: false })
      this.scheduleModalOpen = false
    },
    openAllSchedules() {
      this.allSchedulesModalOpen = true
    },
    closeAllSchedules() {
      this.allSchedulesModalOpen = false
    },

    openWeekGoalDetail() {
      this.goalDetailScope = 'week'
      this.goalDetailModalOpen = true
    },
    openMonthGoalDetail() {
      this.goalDetailScope = 'month'
      this.goalDetailModalOpen = true
    },
    closeGoalDetailModal() {
      this.goalDetailModalOpen = false
    },

    openGrowthGoalModal() {
      this.growthGoalForm = { title: '', sub: '', badgeText: '' }
      this.growthGoalTouched = false
      this.growthGoalModalOpen = true
    },
    closeGrowthGoalModal() {
      this.growthGoalModalOpen = false
    },
    saveGrowthGoal() {
      if (!this.growthGoalForm.title.trim()) {
        this.growthGoalTouched = true
        return
      }
      this.growthGoals.push({
        id: 'gg' + Date.now(),
        title: this.growthGoalForm.title.trim(),
        sub: this.growthGoalForm.sub.trim(),
        badgeText: this.growthGoalForm.badgeText.trim(),
      })
      this.growthGoalModalOpen = false
    },
    deleteGrowthGoal(id: string) {
      this.growthGoals = this.growthGoals.filter((g) => g.id !== id)
    },

    openAchievementModal() {
      this.achievementForm = { text: '' }
      this.achievementTouched = false
      this.achievementModalOpen = true
    },
    closeAchievementModal() {
      this.achievementModalOpen = false
    },
    saveAchievement() {
      if (!this.achievementForm.text.trim()) {
        this.achievementTouched = true
        return
      }
      this.achievements.push({ id: 'ac' + Date.now(), text: this.achievementForm.text.trim() })
      this.achievementModalOpen = false
    },
    deleteAchievement(id: string) {
      this.achievements = this.achievements.filter((a) => a.id !== id)
    },
  },
})
