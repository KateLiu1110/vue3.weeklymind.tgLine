import { defineStore } from 'pinia'

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
  }),
  actions: {
    deleteTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },
    deleteExamDate(id: string) {
      this.examDates = this.examDates.filter((e) => e.id !== id)
    },
  },
})
