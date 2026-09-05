import { defineStore } from 'pinia'
import { createPlan, deletePlan } from '@/api/client/plans'
import { createMilestone } from '@/api/client/milestones'
import {
  createCustomModule as apiCreateCustomModule,
  deleteCustomModule as apiDeleteCustomModule,
} from '@/api/client/customModules'
import { useAuthStore } from '@/stores/auth'
import { queryClient } from '@/plugins/queryClient'
import { queryKeys } from '@/api/queryKeys'

export type BotPlatform = 'line'
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
  startDate?: string | null
  targetDate?: string | null
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

const PLAN_COLOR_PALETTE = ['#ffb21d', '#c9a876', '#2f6bd8', '#b08968']

// There's no real auth backend yet, so login/register simulate the two account
// states this way: this one phone number is the "existing account" with demo
// data; any other number (or a fresh registration) is treated as brand-new
// and lands on the empty state instead. See docs/LOGIN_操作手冊.md.
export const DEMO_ACCOUNT_PHONE = '0912-345-678'

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
    botPlatform: 'line' as BotPlatform,
    botLang: 'zh' as BotLang,
    // Server-backed: hydrated from the API by DashboardLayout on mount (see hydratePlans/
    // hydrateMilestones). Guests never have a token, so the underlying query never
    // fires and these simply stay empty — no separate "demo empty" flag needed.
    plans: [] as Plan[],
    milestones: [] as Milestone[],
    customModules: [] as CustomModule[],
    activeCustomId: null as string | null,
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
    planSaving: false,
    planError: '',

    milestoneModalOpen: false,
    milestoneForm: { title: '', desc: '', module: '', tag: '重點', progress: '0' },
    milestoneTouched: false,
    milestoneSaving: false,
    milestoneError: '',

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
    // 建立時直接打 API，拿後端真正的 id 回來——不再用 client 端亂數 id 塞一個假模組，
    // 這樣模組底下的內容（每日任務／看板卡片／分頁清單）才有地方能存住，見 savePlan()。
    async createCustomModule(kind: CustomModuleKind, title: string) {
      const mod = await apiCreateCustomModule({ kind, title, heroTitle: kind === 'goal' ? title : undefined })
      // 用重新賦值而不是 .push()，理由同 savePlan() 那則註解。
      this.customModules = [...this.customModules, mod]
      this.activeCustomId = mod.id
      return mod
    },
    async deleteCustomModule(id: string) {
      if (!useAuthStore().requireLogin()) return
      this.customModules = this.customModules.filter((m) => m.id !== id)
      if (this.activeCustomId === id) {
        this.activeCustomId = this.customModules[0]?.id ?? null
      }
      await apiDeleteCustomModule(id)
    },
    /** 側邊欄「目標計畫」的刪除入口：一個計畫永遠對應一個自訂模組頁面（見 savePlan），
     * 兩邊要一起刪，不然會留下沒有計畫的空模組、或計畫列表裡點不進去的殭屍項目。 */
    async deletePlanAndModule(customModuleId: string) {
      if (!useAuthStore().requireLogin()) return
      const plan = this.plans.find((p) => p.linkedCustomId === customModuleId)
      await this.deleteCustomModule(customModuleId)
      if (plan) await this.removePlan(plan.id)
    },
    /** Called once per login/logout transition (see DashboardLayout) to clear out
     * whichever account's local-only custom modules were showing. */
    resetLocalState() {
      this.plans = []
      this.milestones = []
      this.customModules = []
      this.activeCustomId = null
    },
    // 這三支的參數都來自 TanStack Query 的 query.data（見 DashboardLayout 呼叫端）。
    // @tanstack/vue-query 預設把整個 query state（含 data）包一層 Vue 的 readonly()，
    // 如果直接把這個參照塞進 Pinia state，後面任何對巢狀陣列的 .push()／.splice() 都會
    // 因為底層還是同一個唯讀 Proxy 而失敗（實測會噴「target is readonly」的警告，看板
    // 模板「新增任務」踩到過）。這裡要深拷貝一份乾淨、完全可寫的資料，徹底切斷跟 query
    // cache 的參照關係——但 structuredClone 對 Vue 的 readonly Proxy 會直接丟
    // 「could not be cloned」（瀏覽器原生的結構化複製認不得 Proxy 包過的 Array/Object），
    // 改用 JSON round-trip：JSON.stringify 是透過一般的屬性存取讀資料，會正確穿過
    // Proxy 的 getter，不會踩到同樣的問題。這裡的資料本來就是 API 回應轉出來的純
    // JSON，不含 Date/函式，用 JSON round-trip 沒有資訊遺失的疑慮。
    hydratePlans(plans: Plan[]) {
      this.plans = JSON.parse(JSON.stringify(plans))
    },
    hydrateMilestones(milestones: Milestone[]) {
      this.milestones = JSON.parse(JSON.stringify(milestones))
    },
    // 只在頁面掛載時整批覆蓋一次（見 DashboardLayout）；畫面編輯期間的自動存檔走另一條
    // debounce 的 PUT，不會再呼叫這支蓋掉正在編輯的內容。
    hydrateCustomModules(modules: CustomModule[]) {
      this.customModules = JSON.parse(JSON.stringify(modules))
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
    async removePlan(id: string) {
      if (!useAuthStore().requireLogin()) return
      this.plans = this.plans.filter((p) => p.id !== id)
      await deletePlan(id)
    },

    openHelpModal() {
      this.helpModalOpen = true
    },
    closeHelpModal() {
      this.helpModalOpen = false
    },

    openPlanModal() {
      if (!useAuthStore().requireLogin()) return
      this.planForm = { title: '', sub: '', template: 'goal', weekdays: [], startTime: '', endTime: '', months: '1' }
      this.planTouched = false
      this.planError = ''
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
    async savePlan() {
      if (!this.planForm.title.trim()) {
        this.planTouched = true
        return
      }
      const title = this.planForm.title.trim()
      const color = PLAN_COLOR_PALETTE[this.plans.length % PLAN_COLOR_PALETTE.length]
      this.planSaving = true
      this.planError = ''

      // A plan always drives a matching custom-module page (的 目標/看板/Tab 模板),
      // mirroring how the design source's plan-template picker unlocks a page.
      // 建立這個模組要先打 API 拿真正的後端 id，這樣它底下的內容才有地方存——
      // 不能再像以前一樣純本地造一個假 id。
      let mod: CustomModule
      try {
        mod = await this.createCustomModule(this.planForm.template, title)
      } catch {
        this.planError = '新增失敗，請確認後端伺服器（server/）是否已啟動'
        this.planSaving = false
        return
      }

      try {
        const plan = await createPlan({
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
        // 用重新賦值而不是 .push()：這兩個 await（先建 CustomModule 再建 Plan）之間
        // 隔了網路請求，這個環境下 reactive array 在 await 之後用 .push() 有時不會
        // 觸發更新（length 讀回來還是 0，實測過），重新賦值一律可靠。
        this.plans = [...this.plans, plan]
        this.planModalOpen = false
        // 新增第一個計畫是「連結收藏」的解鎖條件之一，讓側邊欄鎖定狀態跟著更新。
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all })
      } catch {
        // Roll back the already-created module so a failed plan save doesn't leave
        // an orphaned sidebar entry (and orphaned backend row) with no plan behind it.
        await this.deleteCustomModule(mod.id)
        this.planError = '新增失敗，請確認後端伺服器（server/）是否已啟動'
      } finally {
        this.planSaving = false
      }
    },

    openMilestoneModal() {
      if (!useAuthStore().requireLogin()) return
      this.milestoneForm = { title: '', desc: '', module: '', tag: '重點', progress: '0' }
      this.milestoneTouched = false
      this.milestoneError = ''
      this.milestoneModalOpen = true
    },
    closeMilestoneModal() {
      this.milestoneModalOpen = false
    },
    async saveMilestone() {
      if (!this.milestoneForm.title.trim()) {
        this.milestoneTouched = true
        return
      }
      const color = PLAN_COLOR_PALETTE[this.milestones.length % PLAN_COLOR_PALETTE.length]
      this.milestoneSaving = true
      this.milestoneError = ''
      try {
        const milestone = await createMilestone({
          title: this.milestoneForm.title.trim(),
          tag: this.milestoneForm.tag,
          tagBg: '#f0eada',
          tagCol: color,
          desc: this.milestoneForm.desc.trim(),
          progress: Number(this.milestoneForm.progress) || 0,
          color,
          module: this.milestoneForm.module || 'overview',
        })
        // 用重新賦值而不是 .push()，理由同 savePlan() 那則註解——同樣是 await 之後
        // 才更新陣列，會踩到一樣的問題。
        this.milestones = [...this.milestones, milestone]
        this.milestoneModalOpen = false
      } catch {
        this.milestoneError = '新增失敗，請確認後端伺服器（server/）是否已啟動'
      } finally {
        this.milestoneSaving = false
      }
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
