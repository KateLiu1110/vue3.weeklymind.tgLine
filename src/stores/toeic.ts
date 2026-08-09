import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// 資料本體（目標/任務/考試日期）改由 useToeicPage composable（TanStack Query）提供，
// 這裡只留 Modal/表單的 UI 狀態。
export const useToeicStore = defineStore('toeic', {
  state: () => ({
    examModalOpen: false,
    examForm: { title: '', date: '' },
    examTouched: false,

    scoreModalOpen: false,
    scoreForm: { lastMockScore: '450', targetScore: '600' },

    taskModalOpen: false,
    taskEditId: null as string | null,
    taskForm: { title: '', todayLabel: '', pct: '0' },
    taskTouched: false,
  }),
  getters: {
    taskModalTitle(state): string {
      return state.taskEditId ? '編輯多益任務' : '新增多益任務'
    },
  },
  actions: {
    openExamModal() {
      if (!useAuthStore().requireLogin()) return
      this.examForm = { title: '', date: '' }
      this.examTouched = false
      this.examModalOpen = true
    },
    closeExamModal() {
      this.examModalOpen = false
    },
    openScoreModal(lastMockScore: number, targetScore: number) {
      if (!useAuthStore().requireLogin()) return
      this.scoreForm = { lastMockScore: String(lastMockScore), targetScore: String(targetScore) }
      this.scoreModalOpen = true
    },
    closeScoreModal() {
      this.scoreModalOpen = false
    },
    openTaskModal(task: { id: string; title: string; todayLabel: string; pct: number } | null = null) {
      if (!useAuthStore().requireLogin()) return
      this.taskEditId = task?.id ?? null
      this.taskForm = { title: task?.title ?? '', todayLabel: task?.todayLabel ?? '', pct: task ? String(task.pct) : '0' }
      this.taskTouched = false
      this.taskModalOpen = true
    },
    closeTaskModal() {
      this.taskModalOpen = false
    },
  },
})
