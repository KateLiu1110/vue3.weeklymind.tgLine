import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { useCoreStore, type Plan } from './core'

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

export interface ScheduleBlock {
  id: string
  key: string
  title: string
  startTime: string
  endTime: string
  status: 'done' | 'active' | 'upcoming'
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']
const MATERIAL_ICONS = ['navPerson', 'gym', 'moon', 'navPerson', 'gym', 'leaf', 'mapPin']
// 'sage' | 'peach' | 'none' — semantic colorway per weekday, mapped to literal
// Tailwind classes in the view (kept out of here so the JIT scanner can see them).
const DAY_COLORWAY = ['sage', 'peach', 'none', 'sage', 'peach', 'none', 'sage'] as const
const REST_DAYS = new Set([2, 5])

const CHECKIN_QUOTES = [
  '今天的你也很努力呢！繼續保持！',
  '穩紮穩打，你正在慢慢變強！',
  '小小的堅持，會累積成大大的改變！',
  '今天也辛苦了，記得肯定自己！',
  '每一次打卡，都是給未來的禮物！',
]

/** Monday-first weekday index (0=Mon…6=Sun) for a dayjs date, whose native .day() is Sun-first. */
function mondayIndex(d: dayjs.Dayjs): number {
  const dow = d.day()
  return dow === 0 ? 6 : dow - 1
}

export const useExecStore = defineStore('exec', {
  state: () => ({
    weekNumber: 12,
    selectedDayIndex: null as number | null,
    taskDoneMap: {} as Record<string, boolean>,

    radarSkills: [
      { label: '運動', value: 78 },
      { label: '英文', value: 62 },
      { label: '作品集', value: 45 },
      { label: '生活', value: 55 },
    ] as RadarSkill[],
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

    dateModalOpen: false,
    dateModalMonth: dayjs().format('YYYY-MM'),
    dateModalSelectedDate: dayjs().format('YYYY-MM-DD'),
  }),
  getters: {
    todayColIndex(): number {
      return mondayIndex(dayjs())
    },
    selectedDay(): number {
      return this.selectedDayIndex ?? this.todayColIndex
    },
    todayLabel(): string {
      return DAY_LABELS[this.selectedDay]
    },
    execPlans(): Plan[] {
      const core = useCoreStore()
      return core.plans.filter((p) => (p.weekdays && p.weekdays.length > 0) || p.module === 'exec')
    },
    weekDays(): {
      index: number
      label: string
      date: string
      icon: string
      isToday: boolean
      isRest: boolean
      isSelected: boolean
      colorway: (typeof DAY_COLORWAY)[number]
      dashedBorder: boolean
    }[] {
      const now = dayjs()
      const monday = now.subtract(this.todayColIndex, 'day')
      return DAY_LABELS.map((label, i) => {
        const d = monday.add(i, 'day')
        const isToday = d.isSame(now, 'day')
        const isRest = REST_DAYS.has(i)
        return {
          index: i,
          label,
          date: d.format('M/D'),
          icon: MATERIAL_ICONS[i],
          isToday,
          isRest,
          isSelected: this.selectedDay === i,
          colorway: DAY_COLORWAY[i],
          dashedBorder: !isToday && isRest,
        }
      })
    },
    todayTasks(): { id: string; title: string; done: boolean; key: string }[] {
      const selDay = this.selectedDay
      return this.execPlans
        .filter((p) => (p.weekdays || []).includes(selDay))
        .map((p) => {
          const key = selDay + '_' + p.id
          return { id: p.id, title: p.title, done: !!this.taskDoneMap[key], key }
        })
    },
    scheduleCountByDay(): number[] {
      const counts = [0, 0, 0, 0, 0, 0, 0]
      for (const p of this.execPlans) {
        for (const d of p.weekdays || []) counts[d] = (counts[d] || 0) + 1
      }
      return counts
    },
    scheduledCount(): number {
      return this.scheduleCountByDay.reduce((a, b) => a + b, 0)
    },
    stageBars(): StageBar[] {
      const counts = this.scheduleCountByDay
      const max = Math.max(1, ...counts)
      const todayIdx = this.todayColIndex
      return DAY_LABELS.map((label, i) => ({
        label,
        h: counts[i] ? Math.round(24 + (counts[i] / max) * 62) : 12,
        active: i === todayIdx || counts[i] > 0,
      }))
    },
    dateModalMonthLabel(): string {
      return dayjs(this.dateModalMonth + '-01').format('YYYY年M月')
    },
    dateModalSelectedLabel(): string {
      return dayjs(this.dateModalSelectedDate).format('YYYY年M月D日') + '任務'
    },
    dateModalCalendarDays(): { key: string; dateStr: string; day: number; inMonth: boolean; isToday: boolean; isSelected: boolean }[] {
      const monthStart = dayjs(this.dateModalMonth + '-01')
      const gridStart = monthStart.subtract(monthStart.day(), 'day')
      const today = dayjs()
      return Array.from({ length: 42 }, (_, i) => {
        const d = gridStart.add(i, 'day')
        const dateStr = d.format('YYYY-MM-DD')
        return {
          key: dateStr,
          dateStr,
          day: d.date(),
          inMonth: d.isSame(monthStart, 'month'),
          isToday: d.isSame(today, 'day'),
          isSelected: dateStr === this.dateModalSelectedDate,
        }
      })
    },
    dateModalWeekdayIndex(): number {
      return mondayIndex(dayjs(this.dateModalSelectedDate))
    },
    dateModalTasks(): { id: string; title: string; done: boolean; key: string }[] {
      const selDay = this.dateModalWeekdayIndex
      return this.execPlans
        .filter((p) => (p.weekdays || []).includes(selDay))
        .map((p) => {
          const key = selDay + '_' + p.id
          return { id: p.id, title: p.title, done: !!this.taskDoneMap[key], key }
        })
    },
    dateModalQuote(): string {
      return CHECKIN_QUOTES[dayjs(this.dateModalSelectedDate).date() % CHECKIN_QUOTES.length]
    },
    /** 時程表：直接用計畫本來就有的星期/時段欄位算出來，不需要另外的資料表。跟著上面
     * 週曆選到的日期走。「已完成」是看使用者是否真的在任務清單打勾（跟上面任務清單共用
     * 同一組 taskDoneMap），不是單純比對時鐘時間——不然沒打卡也會被算成已完成。
     * 「進行中」則只在選到「今天」、還沒打勾、而且現在時間落在該時段內才會出現。 */
    selectedDayScheduleBlocks(): ScheduleBlock[] {
      const selDay = this.selectedDay
      const isToday = selDay === this.todayColIndex
      const nowTime = dayjs().format('HH:mm')
      return this.execPlans
        .filter((p) => p.startTime && p.endTime && (p.weekdays || []).includes(selDay))
        .map((p) => {
          const key = selDay + '_' + p.id
          const done = !!this.taskDoneMap[key]
          const isActive = isToday && !done && nowTime >= p.startTime && nowTime < p.endTime
          return {
            id: p.id,
            key,
            title: p.title,
            startTime: p.startTime,
            endTime: p.endTime,
            status: (done ? 'done' : isActive ? 'active' : 'upcoming') as ScheduleBlock['status'],
          }
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    },
  },
  actions: {
    selectDay(i: number) {
      this.selectedDayIndex = i
    },
    toggleTask(key: string) {
      this.taskDoneMap[key] = !this.taskDoneMap[key]
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
    openDateModal() {
      const today = dayjs()
      this.dateModalMonth = today.format('YYYY-MM')
      this.dateModalSelectedDate = today.format('YYYY-MM-DD')
      this.dateModalOpen = true
    },
    closeDateModal() {
      this.dateModalOpen = false
    },
    prevDateModalMonth() {
      this.dateModalMonth = dayjs(this.dateModalMonth + '-01').subtract(1, 'month').format('YYYY-MM')
    },
    nextDateModalMonth() {
      this.dateModalMonth = dayjs(this.dateModalMonth + '-01').add(1, 'month').format('YYYY-MM')
    },
    selectDateModalDate(dateStr: string) {
      this.dateModalSelectedDate = dateStr
    },
    confirmDateCheckin() {
      for (const t of this.dateModalTasks) {
        if (!t.done) this.taskDoneMap[t.key] = true
      }
      this.dateModalOpen = false
    },
  },
})
