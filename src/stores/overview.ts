import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// 資料本體（目標句子/行程提醒/專注任務/成長目標/今日小成就）改由 useOverviewPage composable
// （TanStack Query）提供，這裡只留 Modal/表單的 UI 狀態。
export const useOverviewStore = defineStore('overview', {
  state: () => ({
    editingGoal: false,
    goalDraft: '',
    calendarMonthOffset: 0,

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

    growthGoalModalOpen: false,
    growthGoalForm: { title: '', sub: '', badgeText: '' },
    growthGoalTouched: false,

    achievementModalOpen: false,
    achievementForm: { text: '' },
    achievementTouched: false,
  }),
  actions: {
    startEditGoal(currentTitle: string) {
      if (!useAuthStore().requireLogin()) return
      this.editingGoal = true
      this.goalDraft = currentTitle
    },
    closeEditGoal() {
      this.editingGoal = false
    },
    prevMonth() {
      this.calendarMonthOffset -= 1
    },
    nextMonth() {
      this.calendarMonthOffset += 1
    },

    openFocusTaskModal() {
      if (!useAuthStore().requireLogin()) return
      this.focusForm = { title: '', module: '', progress: '0', due: '' }
      this.focusTouched = false
      this.focusModalOpen = true
    },
    closeFocusTaskModal() {
      this.focusModalOpen = false
    },
    openAllFocusTasks() {
      this.allFocusTasksModalOpen = true
    },
    closeAllFocusTasks() {
      this.allFocusTasksModalOpen = false
    },

    openScheduleModal() {
      if (!useAuthStore().requireLogin()) return
      this.scheduleForm = { date: '', title: '', repeat: 'once', weekday: '1' }
      this.scheduleTouched = false
      this.scheduleModalOpen = true
    },
    closeScheduleModal() {
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
      if (!useAuthStore().requireLogin()) return
      this.growthGoalForm = { title: '', sub: '', badgeText: '' }
      this.growthGoalTouched = false
      this.growthGoalModalOpen = true
    },
    closeGrowthGoalModal() {
      this.growthGoalModalOpen = false
    },

    openAchievementModal() {
      if (!useAuthStore().requireLogin()) return
      this.achievementForm = { text: '' }
      this.achievementTouched = false
      this.achievementModalOpen = true
    },
    closeAchievementModal() {
      this.achievementModalOpen = false
    },
  },
})
