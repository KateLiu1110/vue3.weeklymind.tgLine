import { defineStore } from 'pinia'

export type BotPlatform = 'line' | 'telegram'
export type BotLang = 'zh' | 'en'

export interface Milestone {
  id: string
  title: string
  tag: string
  tagBg: string
  tagCol: string
  desc: string
  progress: number
  color: string
  module: string
}

export interface Plan {
  id: string
  title: string
  sub: string
  pct: number
  checkinsDone: number
  color: string
  module: string
  weekdays: number[]
  startTime: string
  endTime: string
  startDate?: string
  targetDate?: string
  linkedGoalId?: string | null
}

export interface CustomModuleDailyTask {
  id: string
  title: string
  done: boolean
}

export interface CustomModuleScore {
  id: string
  label: string
  value: number
}

export interface CustomModuleExamDate {
  id: string
  title: string
  date: string
}

export interface CustomBoardProject {
  id: string
  name: string
  caption: string
}

export interface CustomBoardColumn {
  id: string
  label: string
  deletable: boolean
  items: CustomBoardProject[]
}

export interface CustomTabItem {
  id: string
  name: string
  done: boolean
}

export interface CustomTabCategory {
  id: string
  label: string
  deletable: boolean
  items: CustomTabItem[]
}

export type CustomModuleKind = 'goal' | 'board' | 'tab'

export interface CustomModule {
  id: string
  title: string
  kind: CustomModuleKind
  // goal kind
  heroTitle: string
  heroDesc: string
  heroSchedule: string
  heroCurrent: string
  heroTarget: string
  dailyTasks: CustomModuleDailyTask[]
  scores: CustomModuleScore[]
  examTitle: string
  examDates: CustomModuleExamDate[]
  scoreTitle: string
  lastLabel: string
  lastScore: string
  targetLabel: string
  targetScore: string
  // board kind
  boardColumns: CustomBoardColumn[]
  // tab kind
  tabCats: CustomTabCategory[]
  activeTabCatId: string | null
}

const TEMPLATE_LABEL: Record<CustomModuleKind, string> = {
  goal: '目標模板',
  board: '看板模板',
  tab: 'Tab 模板',
}

function createBlankCustomModule(kind: CustomModuleKind, title: string): CustomModule {
  return {
    id: 'cm' + Date.now() + Math.random().toString(16).slice(2),
    title,
    kind,
    heroTitle: '',
    heroDesc: '',
    heroSchedule: '',
    heroCurrent: '0',
    heroTarget: '',
    dailyTasks: [],
    scores: [],
    examTitle: '考試天數',
    examDates: [],
    scoreTitle: '分數紀錄',
    lastLabel: '',
    lastScore: '',
    targetLabel: '',
    targetScore: '',
    boardColumns:
      kind === 'board'
        ? [
            { id: 'col-todo', label: '待辦', deletable: false, items: [] },
            { id: 'col-doing', label: '進行中', deletable: false, items: [] },
            { id: 'col-done', label: '已完成', deletable: false, items: [] },
          ]
        : [],
    tabCats: kind === 'tab' ? [{ id: 'cat-1', label: '分類 1', deletable: false, items: [] }] : [],
    activeTabCatId: kind === 'tab' ? 'cat-1' : null,
  }
}

const SEED_PLANS: Plan[] = [
  {
    id: 'plm1',
    title: '鐵人三項報名',
    sub: '賽事報名完成',
    pct: 0,
    checkinsDone: 1,
    color: '#33513f',
    module: 'sport',
    weekdays: [],
    startTime: '',
    endTime: '',
  },
  {
    id: 'pl1',
    title: '多益備考衝刺',
    sub: '週一至週五 07:00–08:00',
    pct: 62,
    checkinsDone: 5,
    color: '#c9a876',
    module: 'toeic',
    weekdays: [0, 1, 2, 3, 4],
    startTime: '07:00',
    endTime: '08:00',
    startDate: '2026-07-01',
    targetDate: '2026-10-01',
  },
  {
    id: 'pl2',
    title: '重訓計畫',
    sub: '週一、三、五 19:00–20:00',
    pct: 40,
    checkinsDone: 3,
    color: '#2f6bd8',
    module: 'sport',
    weekdays: [0, 2, 4],
    startTime: '19:00',
    endTime: '20:00',
    startDate: '2026-07-01',
    targetDate: '2026-09-01',
  },
  {
    id: 'pl3',
    title: '作品集網站上線',
    sub: '週六整理進度',
    pct: 55,
    checkinsDone: 1,
    color: '#33513f',
    module: 'portfolio',
    weekdays: [5],
    startTime: '',
    endTime: '',
    startDate: '2026-07-01',
    targetDate: '2026-09-15',
  },
]

const SEED_MILESTONES: Milestone[] = [
  {
    id: 'ms1',
    title: '多益 600 分',
    tag: '重點',
    tagBg: '#f0eada',
    tagCol: '#b08968',
    desc: '單字量500達成，克漏字&閱讀測驗持續累積',
    progress: 58,
    color: '#c9a876',
    module: 'toeic',
  },
  {
    id: 'ms2',
    title: '作品集初版',
    tag: '進行中',
    tagBg: '#eef3ea',
    tagCol: '#33513f',
    desc: '完成 3 個頁面，尚有台鐵、訂便當專案待開發',
    progress: 42,
    color: '#33513f',
    module: 'portfolio',
  },
]

export const useCoreStore = defineStore('core', {
  state: () => ({
    demoEmpty: false,
    botPlatform: 'line' as BotPlatform,
    botLang: 'zh' as BotLang,
    plans: [...SEED_PLANS] as Plan[],
    milestones: [...SEED_MILESTONES] as Milestone[],
    customModules: [] as CustomModule[],
    activeCustomId: null as string | null,
    streakDays: 14,
    morningTime: '07:30',
    eveningTime: '21:00',
    weeklyReportDay: '五',
    weeklyReportTime: '21:30',
  }),
  getters: {
    activeCustomModule(state): CustomModule | undefined {
      return state.customModules.find((m) => m.id === state.activeCustomId)
    },
    templateLabel() {
      return (kind: CustomModuleKind) => TEMPLATE_LABEL[kind]
    },
  },
  actions: {
    createCustomModule(kind: CustomModuleKind, title: string) {
      const mod = createBlankCustomModule(kind, title)
      this.customModules.push(mod)
      this.activeCustomId = mod.id
      return mod
    },
    deleteCustomModule(id: string) {
      this.customModules = this.customModules.filter((m) => m.id !== id)
      if (this.activeCustomId === id) {
        this.activeCustomId = this.customModules[0]?.id ?? null
      }
    },
    toggleDemoEmpty() {
      this.demoEmpty = !this.demoEmpty
      if (this.demoEmpty) {
        this.plans = []
        this.milestones = []
      } else {
        this.plans = [...SEED_PLANS]
        this.milestones = [...SEED_MILESTONES]
      }
    },
    setBotPlatform(platform: BotPlatform) {
      this.botPlatform = platform
    },
    setBotLang(lang: BotLang) {
      this.botLang = lang
    },
    setCustomTab(id: string) {
      this.activeCustomId = id
    },
    addPlan(plan: Plan) {
      this.plans.push(plan)
    },
    removePlan(id: string) {
      this.plans = this.plans.filter((p) => p.id !== id)
    },
    addMilestone(milestone: Milestone) {
      this.milestones.push(milestone)
    },
    removeMilestone(id: string) {
      this.milestones = this.milestones.filter((m) => m.id !== id)
    },
  },
})
