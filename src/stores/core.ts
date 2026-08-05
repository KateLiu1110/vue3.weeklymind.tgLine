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
  linkedCustomId?: string | null
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

export const PLAN_TEMPLATE_CARDS: { kind: CustomModuleKind; icon: string; label: string; desc: string }[] = [
  { kind: 'goal', icon: 'templateGoal', label: '目標模板', desc: '如：多益 — 追蹤朝單一分數/目標的進度' },
  { kind: 'board', icon: 'templateBoard', label: '看板模板', desc: '如：作品集 — 看板式追蹤多個項目進度' },
  { kind: 'tab', icon: 'templateTab', label: 'Tab模板', desc: '如：運動 — 分類分頁 + 清單打卡' },
]

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
    color: '#ffb21d',
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
    color: '#b08968',
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

const PLAN_COLOR_PALETTE = ['#ffb21d', '#c9a876', '#2f6bd8', '#b08968']

export const MODULE_OPTIONS = [
  { value: 'overview', label: '計劃管理' },
  { value: 'exec', label: '執行中心' },
  { value: 'toeic', label: '多益英文' },
  { value: 'portfolio', label: '作品集看板' },
  { value: 'links', label: '連結收藏' },
  { value: 'sport', label: '運動' },
  { value: 'retro', label: '覆盤中心' },
  { value: 'settings', label: '設定' },
  { value: 'linebot', label: 'LineBot 設定' },
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

    helpModalOpen: false,

    planModalOpen: false,
    allPlansModalOpen: false,
    planForm: {
      title: '',
      sub: '',
      template: 'goal' as CustomModuleKind,
      weekdays: [] as number[],
      startTime: '',
      endTime: '',
      months: '1',
    },
    planTouched: false,

    milestoneModalOpen: false,
    milestoneForm: { title: '', desc: '', module: '', tag: '重點', progress: '0' },
    milestoneTouched: false,

    dailyTaskModalOpen: false,
    dailyTaskEditId: null as string | null,
    dailyTaskForm: { title: '' },
    dailyTaskTouched: false,

    scoreEntryModalOpen: false,
    scoreEntryEditId: null as string | null,
    scoreEntryForm: { label: '', value: '' },
    scoreEntryTouched: false,

    examDateModalOpen: false,
    examDateForm: { title: '', date: '' },
    examDateTouched: false,

    goalScoreModalOpen: false,
    goalScoreForm: { lastLabel: '', lastScore: '', targetLabel: '', targetScore: '' },

    boardModalOpen: false,
    boardEditId: null as string | null,
    boardForm: { name: '', desc: '', start: '', end: '', daily: '0', weekly: '0', monthly: '0', fileName: '' },
    boardTouched: false,

    tabItemModalOpen: false,
    tabItemForm: { name: '', link: '' },
    tabItemTouched: false,

    customItemModalOpen: false,
    customItemForm: { text: '' },
    customItemTouched: false,
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

    openHelpModal() {
      this.helpModalOpen = true
    },
    closeHelpModal() {
      this.helpModalOpen = false
    },

    openPlanModal() {
      this.planForm = { title: '', sub: '', template: 'goal', weekdays: [], startTime: '', endTime: '', months: '1' }
      this.planTouched = false
      this.planModalOpen = true
    },
    closePlanModal() {
      this.planModalOpen = false
    },
    selectPlanTemplate(kind: CustomModuleKind) {
      this.planForm.template = kind
    },
    openAllPlans() {
      this.allPlansModalOpen = true
    },
    closeAllPlans() {
      this.allPlansModalOpen = false
    },
    togglePlanWeekday(day: number) {
      const idx = this.planForm.weekdays.indexOf(day)
      if (idx >= 0) this.planForm.weekdays.splice(idx, 1)
      else this.planForm.weekdays.push(day)
    },
    savePlan() {
      if (!this.planForm.title.trim()) {
        this.planTouched = true
        return
      }
      const title = this.planForm.title.trim()
      const color = PLAN_COLOR_PALETTE[this.plans.length % PLAN_COLOR_PALETTE.length]
      // A plan always drives a matching custom-module page (的 目標/看板/Tab 模板),
      // mirroring how the design source's plan-template picker unlocks a page.
      const mod = createBlankCustomModule(this.planForm.template, title)
      if (mod.kind === 'goal') mod.heroTitle = title
      this.customModules.push(mod)
      this.plans.push({
        id: 'pl' + Date.now(),
        title,
        sub: this.planForm.sub.trim(),
        pct: 0,
        checkinsDone: 0,
        color,
        module: 'exec',
        weekdays: [...this.planForm.weekdays],
        startTime: this.planForm.startTime,
        endTime: this.planForm.endTime,
        linkedCustomId: mod.id,
      })
      this.planModalOpen = false
    },

    openMilestoneModal() {
      this.milestoneForm = { title: '', desc: '', module: '', tag: '重點', progress: '0' }
      this.milestoneTouched = false
      this.milestoneModalOpen = true
    },
    closeMilestoneModal() {
      this.milestoneModalOpen = false
    },
    saveMilestone() {
      if (!this.milestoneForm.title.trim()) {
        this.milestoneTouched = true
        return
      }
      const color = PLAN_COLOR_PALETTE[this.milestones.length % PLAN_COLOR_PALETTE.length]
      this.milestones.push({
        id: 'ms' + Date.now(),
        title: this.milestoneForm.title.trim(),
        tag: this.milestoneForm.tag,
        tagBg: '#f0eada',
        tagCol: color,
        desc: this.milestoneForm.desc.trim(),
        progress: Number(this.milestoneForm.progress) || 0,
        color,
        module: this.milestoneForm.module || 'overview',
      })
      this.milestoneModalOpen = false
    },

    openDailyTaskModal(editId: string | null = null) {
      const mod = this.activeCustomModule
      const task = editId ? mod?.dailyTasks.find((t) => t.id === editId) : null
      this.dailyTaskEditId = editId
      this.dailyTaskForm = { title: task?.title ?? '' }
      this.dailyTaskTouched = false
      this.dailyTaskModalOpen = true
    },
    closeDailyTaskModal() {
      this.dailyTaskModalOpen = false
    },
    saveDailyTask() {
      const title = this.dailyTaskForm.title.trim()
      if (!title) {
        this.dailyTaskTouched = true
        return
      }
      const mod = this.activeCustomModule
      if (!mod) return
      if (this.dailyTaskEditId) {
        const t = mod.dailyTasks.find((x) => x.id === this.dailyTaskEditId)
        if (t) t.title = title
      } else {
        mod.dailyTasks.push({ id: 'dt' + Date.now(), title, done: false })
      }
      this.dailyTaskModalOpen = false
    },

    openScoreEntryModal(editId: string | null = null) {
      const mod = this.activeCustomModule
      const score = editId ? mod?.scores.find((s) => s.id === editId) : null
      this.scoreEntryEditId = editId
      this.scoreEntryForm = { label: score?.label ?? '', value: score ? String(score.value) : '' }
      this.scoreEntryTouched = false
      this.scoreEntryModalOpen = true
    },
    closeScoreEntryModal() {
      this.scoreEntryModalOpen = false
    },
    saveScoreEntry() {
      if (!this.scoreEntryForm.label.trim() || !this.scoreEntryForm.value.trim()) {
        this.scoreEntryTouched = true
        return
      }
      const mod = this.activeCustomModule
      if (!mod) return
      const value = Number(this.scoreEntryForm.value) || 0
      if (this.scoreEntryEditId) {
        const s = mod.scores.find((x) => x.id === this.scoreEntryEditId)
        if (s) {
          s.label = this.scoreEntryForm.label.trim()
          s.value = value
        }
      } else {
        mod.scores.push({ id: 'sc' + Date.now(), label: this.scoreEntryForm.label.trim(), value })
      }
      this.scoreEntryModalOpen = false
    },

    openExamDateModal() {
      this.examDateForm = { title: '', date: '' }
      this.examDateTouched = false
      this.examDateModalOpen = true
    },
    closeExamDateModal() {
      this.examDateModalOpen = false
    },
    saveExamDate() {
      if (!this.examDateForm.title.trim() || !this.examDateForm.date) {
        this.examDateTouched = true
        return
      }
      const mod = this.activeCustomModule
      if (!mod) return
      mod.examDates.push({ id: 'ed' + Date.now(), title: this.examDateForm.title.trim(), date: this.examDateForm.date })
      this.examDateModalOpen = false
    },

    openGoalScoreModal() {
      const mod = this.activeCustomModule
      this.goalScoreForm = {
        lastLabel: mod?.lastLabel ?? '',
        lastScore: mod?.lastScore ?? '',
        targetLabel: mod?.targetLabel ?? '',
        targetScore: mod?.targetScore ?? '',
      }
      this.goalScoreModalOpen = true
    },
    closeGoalScoreModal() {
      this.goalScoreModalOpen = false
    },
    saveGoalScoreForm() {
      const mod = this.activeCustomModule
      if (!mod) return
      mod.lastLabel = this.goalScoreForm.lastLabel
      mod.lastScore = this.goalScoreForm.lastScore
      mod.targetLabel = this.goalScoreForm.targetLabel
      mod.targetScore = this.goalScoreForm.targetScore
      this.goalScoreModalOpen = false
    },
    clearGoalScoreForm() {
      const mod = this.activeCustomModule
      if (mod) {
        mod.lastLabel = ''
        mod.lastScore = ''
        mod.targetLabel = ''
        mod.targetScore = ''
      }
      this.goalScoreModalOpen = false
    },

    openBoardModal(editId: string | null = null) {
      const mod = this.activeCustomModule
      const project = editId ? mod?.boardColumns.flatMap((c) => c.items).find((p) => p.id === editId) : null
      this.boardEditId = editId
      this.boardForm = {
        name: project?.name ?? '',
        desc: project?.caption ?? '',
        start: '',
        end: '',
        daily: '0',
        weekly: '0',
        monthly: '0',
        fileName: '',
      }
      this.boardTouched = false
      this.boardModalOpen = true
    },
    closeBoardModal() {
      this.boardModalOpen = false
    },
    saveBoardProjectForm() {
      if (!this.boardForm.name.trim()) {
        this.boardTouched = true
        return
      }
      const mod = this.activeCustomModule
      if (!mod || mod.boardColumns.length === 0) return
      if (this.boardEditId) {
        for (const col of mod.boardColumns) {
          const p = col.items.find((x) => x.id === this.boardEditId)
          if (p) {
            p.name = this.boardForm.name.trim()
            p.caption = this.boardForm.desc.trim()
            break
          }
        }
      } else {
        mod.boardColumns[0].items.push({
          id: 'bp' + Date.now(),
          name: this.boardForm.name.trim(),
          caption: this.boardForm.desc.trim(),
        })
      }
      this.boardModalOpen = false
    },

    openTabItemModal() {
      this.tabItemForm = { name: '', link: '' }
      this.tabItemTouched = false
      this.tabItemModalOpen = true
    },
    closeTabItemModal() {
      this.tabItemModalOpen = false
    },
    saveTabItem() {
      if (!this.tabItemForm.name.trim()) {
        this.tabItemTouched = true
        return
      }
      const mod = this.activeCustomModule
      const cat = mod?.tabCats.find((c) => c.id === mod.activeTabCatId) ?? mod?.tabCats[0]
      if (!cat) return
      cat.items.push({ id: 'ti' + Date.now(), name: this.tabItemForm.name.trim(), done: false })
      this.tabItemModalOpen = false
    },

    openCustomItemModal() {
      this.customItemForm = { text: '' }
      this.customItemTouched = false
      this.customItemModalOpen = true
    },
    closeCustomItemModal() {
      this.customItemModalOpen = false
    },
    saveCustomItem() {
      if (!this.customItemForm.text.trim()) {
        this.customItemTouched = true
        return
      }
      const mod = this.activeCustomModule
      if (!mod) return
      mod.dailyTasks.push({ id: 'ci' + Date.now(), title: this.customItemForm.text.trim(), done: false })
      this.customItemModalOpen = false
    },
  },
})
