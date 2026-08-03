import { defineStore } from 'pinia'
import dayjs from 'dayjs'

export interface ToeicTask {
  id: string
  title: string
  iconKey: string
  todayLabel: string
  pct: number
  statusLabel: string
  done: boolean
}

export interface ExamDate {
  id: string
  title: string
  date: string
  daysLeft: number
}

export const useToeicStore = defineStore('toeic', {
  state: () => ({
    goalTitle: '多益目標 600 分',
    goalDesc: '每日車上 1 小時：背單字、閱讀測驗、克漏字、英文課本、每日對話。每週固定晚上英文課。',
    classSchedule: '每週三 19:00 英文課',
    lastMockScore: 450,
    targetScore: 600,
    scoreTrend: [
      { label: '3 月模擬', h: 45, highlight: false },
      { label: '4 月模擬', h: 52, highlight: false },
      { label: '5 月模擬', h: 60, highlight: false },
      { label: '6 月模擬', h: 75, highlight: true },
    ],
    examDates: [
      { id: 'ex1', title: '多益公開測驗', date: '2025-09-14', daysLeft: 48 },
      { id: 'ex2', title: '第 2 次模擬考', date: '2025-08-20', daysLeft: 23 },
    ] as ExamDate[],
    tasks: [
      { id: 'tt1', title: '背單字', iconKey: 'vocab', todayLabel: '今日 20 / 20 個', pct: 100, statusLabel: '已完成', done: true },
      { id: 'tt2', title: '閱讀測驗', iconKey: 'book', todayLabel: '今日 1 / 1 篇', pct: 100, statusLabel: '已完成', done: true },
      { id: 'tt3', title: '克漏字', iconKey: 'chat', todayLabel: '今日 0 / 1 篇', pct: 0, statusLabel: '待完成', done: false },
      { id: 'tt4', title: '英文課本', iconKey: 'book', todayLabel: 'Unit 8 · 完成 60%', pct: 60, statusLabel: '進行中', done: false },
      { id: 'tt5', title: '每日對話', iconKey: 'chat', todayLabel: '今日 0 / 1 段', pct: 0, statusLabel: '待完成', done: false },
    ] as ToeicTask[],

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
    deleteTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },
    deleteExamDate(id: string) {
      this.examDates = this.examDates.filter((e) => e.id !== id)
    },

    openExamModal() {
      this.examForm = { title: '', date: '' }
      this.examTouched = false
      this.examModalOpen = true
    },
    closeExamModal() {
      this.examModalOpen = false
    },
    saveExamDate() {
      if (!this.examForm.title.trim() || !this.examForm.date) {
        this.examTouched = true
        return
      }
      const daysLeft = dayjs(this.examForm.date).diff(dayjs(), 'day')
      this.examDates.push({
        id: 'ex' + Date.now(),
        title: this.examForm.title.trim(),
        date: this.examForm.date,
        daysLeft: Math.max(daysLeft, 0),
      })
      this.examModalOpen = false
    },

    openScoreModal() {
      this.scoreForm = { lastMockScore: String(this.lastMockScore), targetScore: String(this.targetScore) }
      this.scoreModalOpen = true
    },
    closeScoreModal() {
      this.scoreModalOpen = false
    },
    saveScore() {
      this.lastMockScore = Number(this.scoreForm.lastMockScore) || 0
      this.targetScore = Number(this.scoreForm.targetScore) || 0
      this.scoreModalOpen = false
    },

    openTaskModal(editId: string | null = null) {
      const task = editId ? this.tasks.find((t) => t.id === editId) : null
      this.taskEditId = editId
      this.taskForm = { title: task?.title ?? '', todayLabel: task?.todayLabel ?? '', pct: task ? String(task.pct) : '0' }
      this.taskTouched = false
      this.taskModalOpen = true
    },
    closeTaskModal() {
      this.taskModalOpen = false
    },
    saveTask() {
      if (!this.taskForm.title.trim()) {
        this.taskTouched = true
        return
      }
      const pct = Math.min(100, Math.max(0, Number(this.taskForm.pct) || 0))
      const done = pct >= 100
      if (this.taskEditId) {
        const t = this.tasks.find((x) => x.id === this.taskEditId)
        if (t) {
          t.title = this.taskForm.title.trim()
          t.todayLabel = this.taskForm.todayLabel.trim()
          t.pct = pct
          t.done = done
          t.statusLabel = done ? '已完成' : pct > 0 ? '進行中' : '待完成'
        }
      } else {
        this.tasks.push({
          id: 'tt' + Date.now(),
          title: this.taskForm.title.trim(),
          iconKey: 'goal',
          todayLabel: this.taskForm.todayLabel.trim(),
          pct,
          statusLabel: done ? '已完成' : pct > 0 ? '進行中' : '待完成',
          done,
        })
      }
      this.taskModalOpen = false
    },
  },
})
