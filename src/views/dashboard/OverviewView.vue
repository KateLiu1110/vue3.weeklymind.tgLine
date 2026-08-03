<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useCoreStore, MODULE_OPTIONS } from '@/stores/core'
import { useOverviewStore } from '@/stores/overview'
import Icon from '@/components/common/Icon.vue'
import Modal from '@/components/common/Modal.vue'

const weekdayShort = ['一', '二', '三', '四', '五', '六', '日']

const core = useCoreStore()
const ov = useOverviewStore()

const totalGoalCount = computed(() => core.plans.length)

const calendarMonth = computed(() => dayjs().add(ov.calendarMonthOffset, 'month'))
const calendarMonthLabel = computed(() => calendarMonth.value.format('YYYY 年 M 月'))
const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六']

const calendarCells = computed(() => {
  const start = calendarMonth.value.startOf('month')
  const gridStart = start.startOf('week')
  const today = dayjs()
  return Array.from({ length: 42 }, (_, i) => {
    const d = gridStart.add(i, 'day')
    return {
      key: d.format('YYYY-MM-DD'),
      label: d.date(),
      isToday: d.isSame(today, 'day'),
      inMonth: d.month() === calendarMonth.value.month(),
    }
  })
})

const PIE_RADIUS = 32
const PIE_CIRC = 2 * Math.PI * PIE_RADIUS
const plansPieArcs = computed(() => {
  const n = core.plans.length
  if (n === 0) return []
  const slice = PIE_CIRC / n
  let offset = 0
  return core.plans.map((p) => {
    const arc = { color: p.color, dasharray: `${slice} ${PIE_CIRC - slice}`, dashoffset: -offset }
    offset += slice
    return arc
  })
})
const plansPieLegend = computed(() => core.plans.slice(0, 4).map((p) => ({ name: p.title, color: p.color })))
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- ROW 1: hero goal card -->
    <div
      class="rounded-card p-5.5 relative overflow-hidden"
      style="background: linear-gradient(120deg, var(--color-brand-primary-dark), var(--color-brand-primary))"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-start gap-3.5 flex-[1.3] min-w-0">
          <img src="/assets/mascot-dog-2.png" class="w-20 h-20 rounded-2xl object-cover shrink-0" />
          <div class="relative flex-1 min-w-0">
            <div class="relative bg-white rounded-card px-4 py-3">
              <p class="m-0 text-xs italic text-sand-600">每天的一小步，到了目標日都會變成巨大的里程碑！</p>
              <div v-if="ov.editingGoal" class="flex gap-2 items-center mt-1.5">
                <input
                  v-model="ov.goalDraft"
                  class="w-full px-3 py-2 rounded-control border border-sand-200 bg-white text-base font-medium text-ink-900 outline-none"
                />
                <button
                  type="button"
                  class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-control cursor-pointer whitespace-nowrap"
                  @click="ov.saveGoal()"
                >
                  儲存
                </button>
              </div>
              <div v-else class="flex items-center gap-2.5 mt-1">
                <p class="m-0 font-medium text-ink-900" style="font-size: 17px">{{ ov.goalTitle }}</p>
                <span
                  class="cursor-pointer flex items-center gap-1 text-xs text-brand-primary shrink-0"
                  @click="ov.startEditGoal()"
                >
                  <Icon name="edit" :size="13" />編輯
                </span>
              </div>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-white/80">
              目前共 {{ totalGoalCount }} 項目標追蹤中，持續打卡就能穩定邁向每一項里程碑。
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="relative w-19.5 h-19.5 shrink-0">
            <svg width="78" height="78" viewBox="0 0 78 78" style="transform: rotate(-90deg)">
              <circle cx="39" cy="39" r="32" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="11" />
              <circle
                v-for="(arc, i) in plansPieArcs"
                :key="i"
                cx="39"
                cy="39"
                r="32"
                fill="none"
                :stroke="arc.color"
                stroke-width="11"
                :stroke-dasharray="arc.dasharray"
                :stroke-dashoffset="arc.dashoffset"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="font-medium text-white text-sm">{{ totalGoalCount }}</span>
              <span class="text-[8.5px] text-white/75">全部計畫</span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 min-w-0">
            <span
              v-for="lg in plansPieLegend"
              :key="lg.name"
              class="flex items-center gap-1.5 text-xs text-white whitespace-nowrap overflow-hidden text-ellipsis"
            >
              <span class="w-2.5 h-2.5 rounded shrink-0" :style="{ background: lg.color }" />{{ lg.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ROW 2: week / month / calendar -->
    <div class="flex gap-4 items-stretch flex-wrap lg:flex-nowrap">
      <div class="flex-1 bg-cream-100 rounded-card p-4 min-w-[220px]">
        <div class="flex justify-between items-center">
          <span class="flex items-center gap-1.5 text-xs font-medium text-ink-800"><Icon name="calendar" :size="12" />週目標</span>
          <span class="text-xs font-medium text-clay-500">{{ ov.weekGoalPct }}%</span>
        </div>
        <p class="my-1.5 text-xs text-sand-600">{{ ov.weekGoalLabel }}</p>
        <div class="h-1.5 rounded-full bg-white overflow-hidden mb-2.5">
          <div class="h-full bg-clay-400" :style="{ width: ov.weekGoalPct + '%' }" />
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="wi in ov.weekGoalItems" :key="wi.id">
            <div class="text-xs font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ wi.title }}</div>
            <div class="flex justify-between text-xs text-clay-500 mt-0.5"><span>{{ wi.daysLabel }}</span><span>{{ wi.pct }}%</span></div>
            <div class="h-1 rounded-full bg-white mt-1 overflow-hidden"><div class="h-full bg-clay-400" :style="{ width: wi.pct + '%' }" /></div>
          </div>
        </div>
        <span class="inline-block mt-2 text-xs font-medium text-clay-500 cursor-pointer" @click="ov.openWeekGoalDetail()">更多 →</span>
      </div>

      <div class="flex-1 bg-mint-cream rounded-card p-4 min-w-[220px]">
        <div class="flex justify-between items-center">
          <span class="flex items-center gap-1.5 text-xs font-medium text-ink-800"><Icon name="calendar" :size="12" />月目標</span>
          <span class="text-xs font-medium text-brand-primary">{{ ov.monthGoalPct }}%</span>
        </div>
        <p class="my-1.5 text-xs text-sand-600">{{ ov.monthGoalLabel }}</p>
        <div class="h-1.5 rounded-full bg-white overflow-hidden mb-2.5">
          <div class="h-full bg-brand-primary" :style="{ width: ov.monthGoalPct + '%' }" />
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="mi in ov.monthGoalItems" :key="mi.id">
            <div class="text-xs font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ mi.title }}</div>
            <div class="flex justify-between text-xs text-brand-primary mt-0.5"><span>{{ mi.daysLabel }}</span><span>{{ mi.pct }}%</span></div>
            <div class="h-1 rounded-full bg-white mt-1 overflow-hidden"><div class="h-full bg-brand-primary" :style="{ width: mi.pct + '%' }" /></div>
          </div>
        </div>
        <span class="inline-block mt-2 text-xs font-medium text-brand-primary cursor-pointer" @click="ov.openMonthGoalDetail()">更多 →</span>
      </div>

      <div class="flex-[1.3] rounded-card p-4.5 min-w-[260px] bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-sm font-medium text-ink-800 whitespace-nowrap shrink-0">{{ calendarMonthLabel }}</span>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-sand-600 text-sm cursor-pointer px-1" @click="ov.prevMonth()">‹</span>
            <span class="text-sand-600 text-sm cursor-pointer px-1" @click="ov.nextMonth()">›</span>
            <span class="flex items-center gap-1 text-[10.5px] font-medium text-sand-600 border border-sand-200 rounded-full px-2 py-0.5 whitespace-nowrap">
              <Icon name="refresh" :size="11" />同步
            </span>
          </div>
        </div>
        <div class="grid grid-cols-7 gap-0.5 text-xs text-sand-400 text-center mb-1">
          <span v-for="w in weekdayLabels" :key="w">{{ w }}</span>
        </div>
        <div class="grid grid-cols-7 gap-0.5 text-xs text-center text-ink-700">
          <span
            v-for="cell in calendarCells"
            :key="cell.key"
            class="rounded py-0.5"
            :class="[
              cell.isToday ? 'bg-brand-primary text-white font-medium' : '',
              !cell.inMonth ? 'text-sand-300' : '',
            ]"
          >
            {{ cell.label }}
          </span>
        </div>

        <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-cream-150">
          <span class="text-xs font-medium text-ink-800">最新行程提醒</span>
          <span class="flex items-center gap-2.5 shrink-0">
            <span class="text-xs text-brand-primary font-medium cursor-pointer whitespace-nowrap" @click="ov.openScheduleModal()">＋ 新增</span>
            <span class="text-xs text-brand-primary font-medium cursor-pointer whitespace-nowrap" @click="ov.openAllSchedules()">全部 →</span>
          </span>
        </div>
        <p v-if="ov.schedules.length === 0" class="mt-2 text-xs text-sand-400">尚未新增行程</p>
        <div v-else class="flex flex-col gap-1.5 mt-2">
          <div v-for="sc in ov.schedules" :key="sc.id" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center shrink-0">
              <span class="text-xs font-medium text-clay-500">{{ sc.day }}</span>
            </div>
            <div class="flex-1 min-w-0 text-xs font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ sc.title }}
            </div>
            <span
              class="cursor-pointer shrink-0"
              :class="sc.reminded ? 'text-brand-primary' : 'text-sand-400'"
              @click="ov.toggleReminded(sc.id)"
            >
              <Icon name="checkCircle" :size="14" />
            </span>
            <span class="cursor-pointer text-danger shrink-0" @click="ov.deleteSchedule(sc.id)">
              <Icon name="trash" :size="13" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Milestones -->
    <div>
      <div class="flex items-center justify-between mt-2 mb-2.5">
        <div class="text-sm font-medium text-ink-800">
          里程碑<span class="text-xs text-sand-400 font-normal ml-2">（打卡完成的目標）</span>
        </div>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="core.openMilestoneModal()">＋ 新增里程碑</span>
      </div>
      <div v-if="core.milestones.length === 0" class="rounded-card p-5.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2 mb-0 text-xs font-medium text-sand-600">尚無打卡完成的目標</p>
        <p class="mt-0.5 mb-0 text-xs text-sand-400">在「進行中的計畫」持續打卡直到完成，會自動出現在這裡</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div
          v-for="ms in core.milestones"
          :key="ms.id"
          class="rounded-card p-4 flex gap-3 bg-cream-50 border border-cream-150"
        >
          <img src="/assets/mascot-dog-2.png" class="w-9.5 h-9.5 rounded-xl object-cover shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ ms.title }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full shrink-0 ml-1.5" :style="{ background: ms.tagBg, color: ms.tagCol }">{{ ms.tag }}</span>
            </div>
            <p class="my-1.5 text-xs text-sand-500">{{ ms.desc }}</p>
            <div class="relative h-4.5 rounded-full bg-cream-175 overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-0.5"
                :style="{
                  width: ms.progress + '%',
                  background: `repeating-linear-gradient(45deg, ${ms.color}, ${ms.color} 7px, rgba(255,255,255,0.28) 7px, rgba(255,255,255,0.28) 14px)`,
                }"
              >
                <span class="w-3.5 h-3.5 rounded-full bg-white/90 flex items-center justify-center shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" :fill="ms.color">
                    <circle cx="12" cy="16" r="5.5" />
                    <circle cx="5" cy="8" r="2.6" />
                    <circle cx="19" cy="8" r="2.6" />
                    <circle cx="9" cy="4" r="2.3" />
                    <circle cx="15" cy="4" r="2.3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <div>
      <div class="flex items-center justify-between mt-1.5 mb-2.5">
        <span class="text-sm font-medium text-ink-800">進行中的計畫</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="core.openAllPlans()">查看全部 →</span>
      </div>
      <div v-if="core.plans.length === 0" class="rounded-card p-5.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2 mb-0.5 text-xs font-medium text-sand-600">尚未有進行中的計畫</p>
        <p class="my-0 text-xs text-sand-400">新增第一筆計畫</p>
        <button
          type="button"
          class="mt-3 inline-flex items-center gap-1.5 bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer"
          @click="core.openPlanModal()"
        >
          ＋ 新增計畫
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div
          v-for="p in core.plans"
          :key="p.id"
          class="rounded-card p-4 flex items-center gap-3.5 bg-cream-50 border border-cream-150"
        >
          <div class="relative w-13 h-13 shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52" style="transform: rotate(-90deg)">
              <circle cx="26" cy="26" r="21" fill="none" class="stroke-cream-150" stroke-width="7" />
              <circle
                cx="26"
                cy="26"
                r="21"
                fill="none"
                :stroke="p.color"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="132"
                :stroke-dashoffset="132 - (132 * p.pct) / 100"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-ink-900">{{ p.pct }}%</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ p.title }}</div>
            <div class="text-xs text-sand-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{{ p.sub }}</div>
            <div class="text-xs text-clay-500 mt-0.5 whitespace-nowrap">已打卡 {{ p.checkinsDone }} 次</div>
          </div>
          <span class="cursor-pointer text-danger shrink-0" @click="core.removePlan(p.id)"><Icon name="trash" :size="13" /></span>
        </div>
      </div>
    </div>

    <!-- Focus tasks -->
    <div>
      <div class="flex items-center justify-between mt-1.5 mb-2.5">
        <span class="text-sm font-medium text-ink-800">當前專注任務</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="ov.openAllFocusTasks()">查看全部 →</span>
      </div>
      <div v-if="ov.focusTasks.length === 0" class="rounded-card p-6.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚未建立任何專注任務</p>
        <p class="my-0 text-xs text-sand-400">新增第一個任務，開始追蹤你的計畫</p>
        <button
          type="button"
          class="mt-3 inline-flex items-center gap-1.5 bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer"
          @click="ov.openFocusTaskModal()"
        >
          ＋ 新增專注任務
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div v-for="ft in ov.focusTasks" :key="ft.id" class="rounded-card p-4 bg-cream-50 border border-cream-150">
          <span class="text-xs px-2 py-0.5 rounded-full" :class="[ft.tagBg, ft.tagCol]">{{ ft.moduleLabel }}</span>
          <div class="text-sm font-medium text-ink-900 mt-2">{{ ft.title }}</div>
          <div class="h-1.5 rounded-full bg-cream-150 mt-2.5"><div class="h-full rounded-full bg-clay-500" :style="{ width: ft.progress + '%' }" /></div>
          <div class="flex items-center justify-between mt-1.5">
            <span class="flex items-center gap-1 text-xs text-sand-500"><Icon name="calendar" :size="11" />{{ ft.due }}</span>
            <span class="cursor-pointer text-danger" @click="ov.deleteFocusTask(ft.id)"><Icon name="trash" :size="13" /></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Growth goals -->
    <div>
      <div class="flex items-center justify-between mt-1.5 mb-2.5">
        <span class="text-sm font-medium text-ink-800">成長目標</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="ov.openGrowthGoalModal()">＋ 新增</span>
      </div>
      <div v-if="ov.growthGoals.length === 0" class="rounded-card p-5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <p class="m-0 text-xs font-medium text-sand-600">尚未建立成長目標</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div v-for="g in ov.growthGoals" :key="g.id" class="rounded-card p-4 flex items-center gap-3 bg-cream-50 border border-cream-150">
          <span v-if="g.badgeText" class="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center text-xs font-medium text-clay-500 shrink-0">
            {{ g.badgeText }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-ink-900">{{ g.title }}</div>
            <div v-if="g.sub" class="text-xs text-sand-500 mt-0.5">{{ g.sub }}</div>
          </div>
          <span class="cursor-pointer text-danger shrink-0" @click="ov.deleteGrowthGoal(g.id)"><Icon name="trash" :size="13" /></span>
        </div>
      </div>
    </div>

    <!-- Today's small achievements -->
    <div>
      <div class="flex items-center justify-between mt-1.5 mb-2.5">
        <span class="text-sm font-medium text-ink-800">今日小成就</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="ov.openAchievementModal()">＋ 新增</span>
      </div>
      <div v-if="ov.achievements.length === 0" class="rounded-card p-5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <p class="m-0 text-xs font-medium text-sand-600">今天還沒有記錄任何小成就</p>
      </div>
      <div v-else class="flex flex-col gap-2">
        <div v-for="a in ov.achievements" :key="a.id" class="rounded-card px-4 py-2.5 flex items-center gap-2.5 bg-cream-50 border border-cream-150">
          <span class="flex-1 text-sm text-ink-900">{{ a.text }}</span>
          <span class="cursor-pointer text-danger shrink-0" @click="ov.deleteAchievement(a.id)"><Icon name="trash" :size="13" /></span>
        </div>
      </div>
    </div>

    <!-- Focus task modal -->
    <Modal v-if="ov.focusModalOpen" title="新增專注任務" :width="420" @close="ov.closeFocusTaskModal()">
      <label class="text-xs font-medium text-ink-700">任務內容</label>
      <input
        v-model="ov.focusForm.title"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="ov.focusTouched && !ov.focusForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">所屬模組</label>
      <select v-model="ov.focusForm.module" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="">請選擇所屬模組</option>
        <option v-for="opt in MODULE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <div class="flex gap-3 mb-3.5">
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">進度 %</label>
          <input v-model="ov.focusForm.progress" type="number" min="0" max="100" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">完成日期</label>
          <input v-model="ov.focusForm.due" type="date" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
      </div>
      <p v-if="ov.focusTouched && !ov.focusForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫任務內容</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="ov.closeFocusTaskModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="ov.saveFocusTask()">儲存</button>
      </div>
    </Modal>

    <!-- Milestone modal -->
    <Modal v-if="core.milestoneModalOpen" title="新增里程碑" :width="420" @close="core.closeMilestoneModal()">
      <label class="text-xs font-medium text-ink-700">里程碑標題</label>
      <input
        v-model="core.milestoneForm.title"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.milestoneTouched && !core.milestoneForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">說明</label>
      <input v-model="core.milestoneForm.desc" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">所屬模組</label>
      <select v-model="core.milestoneForm.module" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="">請選擇所屬模組</option>
        <option v-for="opt in MODULE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <div class="flex gap-3 mb-3.5">
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">標籤文字</label>
          <input v-model="core.milestoneForm.tag" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">進度 %</label>
          <input v-model="core.milestoneForm.progress" type="number" min="0" max="100" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
      </div>
      <p v-if="core.milestoneTouched && !core.milestoneForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫里程碑標題</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closeMilestoneModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="core.saveMilestone()">儲存</button>
      </div>
    </Modal>

    <!-- Plan modal -->
    <Modal v-if="core.planModalOpen" title="新增計畫" :width="420" @close="core.closePlanModal()">
      <label class="text-xs font-medium text-ink-700">計畫名稱</label>
      <input
        v-model="core.planForm.title"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.planTouched && !core.planForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">副標</label>
      <input v-model="core.planForm.sub" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">所屬模組</label>
      <select v-model="core.planForm.module" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="">請選擇所屬模組</option>
        <option v-for="opt in MODULE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <label class="text-xs font-medium text-ink-700">執行星期（可複選）</label>
      <div class="flex gap-1.5 mt-1.5 mb-3.5">
        <span
          v-for="(w, i) in weekdayShort"
          :key="i"
          class="flex-1 text-center py-2 rounded-control text-xs font-medium cursor-pointer"
          :class="core.planForm.weekdays.includes(i) ? 'bg-brand-primary text-white' : 'bg-cream-100 text-ink-700'"
          @click="core.togglePlanWeekday(i)"
        >
          {{ w }}
        </span>
      </div>
      <div class="flex gap-3 mb-3.5">
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">開始時間</label>
          <input v-model="core.planForm.startTime" type="time" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">結束時間</label>
          <input v-model="core.planForm.endTime" type="time" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
      </div>
      <label class="text-xs font-medium text-ink-700">預計多久完成</label>
      <select v-model="core.planForm.months" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="1">1 個月</option>
        <option value="2">2 個月</option>
        <option value="3">3 個月</option>
        <option value="6">6 個月</option>
        <option value="12">12 個月</option>
      </select>
      <p class="m-0 mb-3.5 text-xs text-sand-400">完成度將依每日打卡自動計算，無須手動設定</p>
      <p v-if="core.planTouched && !core.planForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫計畫名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closePlanModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="core.savePlan()">新增</button>
      </div>
    </Modal>

    <!-- Schedule modal -->
    <Modal v-if="ov.scheduleModalOpen" title="新增行程" :width="380" @close="ov.closeScheduleModal()">
      <label class="text-xs font-medium text-ink-700">重複頻率</label>
      <select v-model="ov.scheduleForm.repeat" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="once">單次</option>
        <option value="weekly">每週固定提醒</option>
      </select>
      <template v-if="ov.scheduleForm.repeat === 'once'">
        <label class="text-xs font-medium text-ink-700">日期</label>
        <input
          v-model="ov.scheduleForm.date"
          type="date"
          class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
          :class="ov.scheduleTouched && !ov.scheduleForm.date ? 'border-coral' : 'border-sand-200'"
        />
      </template>
      <template v-else>
        <label class="text-xs font-medium text-ink-700">每週星期</label>
        <select v-model="ov.scheduleForm.weekday" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
          <option value="1">每週一</option>
          <option value="2">每週二</option>
          <option value="3">每週三</option>
          <option value="4">每週四</option>
          <option value="5">每週五</option>
          <option value="6">每週六</option>
          <option value="0">每週日</option>
        </select>
      </template>
      <label class="text-xs font-medium text-ink-700">事件名稱</label>
      <input
        v-model="ov.scheduleForm.title"
        placeholder="例：跟朋友吃飯"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="ov.scheduleTouched && !ov.scheduleForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <p v-if="ov.scheduleTouched" class="text-danger text-xs mb-2.5">⚠ 請填寫日期與事件名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="ov.closeScheduleModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="ov.saveSchedule()">儲存</button>
      </div>
    </Modal>

    <!-- All schedules modal -->
    <Modal v-if="ov.allSchedulesModalOpen" title="全部行程提醒" :width="420" @close="ov.closeAllSchedules()">
      <div class="flex flex-col gap-2.5">
        <div v-for="sc in ov.schedules" :key="sc.id" class="rounded-card p-3.5 flex items-center gap-3.5 bg-cream-100">
          <div class="w-11 h-11 rounded-xl bg-cream-50 flex items-center justify-center text-sm font-medium text-clay-500 shrink-0">{{ sc.day }}</div>
          <div class="flex-1 min-w-0 text-sm font-medium text-ink-900">{{ sc.title }}</div>
          <span class="cursor-pointer shrink-0" :class="sc.reminded ? 'text-brand-primary' : 'text-sand-400'" @click="ov.toggleReminded(sc.id)">
            <Icon name="checkCircle" :size="14" />
          </span>
          <span class="cursor-pointer text-danger shrink-0" @click="ov.deleteSchedule(sc.id)"><Icon name="trash" :size="13" /></span>
        </div>
      </div>
    </Modal>

    <!-- All plans modal -->
    <Modal v-if="core.allPlansModalOpen" title="進行中的計畫" :width="460" @close="core.closeAllPlans()">
      <div class="flex flex-col gap-2.5">
        <div v-for="p in core.plans" :key="p.id" class="rounded-card p-3.5 flex items-center gap-3.5 bg-cream-100">
          <div class="relative w-11.5 h-11.5 shrink-0">
            <svg width="46" height="46" viewBox="0 0 52 52" style="transform: rotate(-90deg)">
              <circle cx="26" cy="26" r="21" fill="none" class="stroke-cream-150" stroke-width="7" />
              <circle cx="26" cy="26" r="21" fill="none" :stroke="p.color" stroke-width="7" stroke-linecap="round" stroke-dasharray="132" :stroke-dashoffset="132 - (132 * p.pct) / 100" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-ink-900">{{ p.pct }}%</div>
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-ink-900">{{ p.title }}</div>
            <div class="text-xs text-sand-500 mt-0.5">{{ p.sub }}</div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- All focus tasks modal -->
    <Modal v-if="ov.allFocusTasksModalOpen" title="當前專注任務" :width="460" @close="ov.closeAllFocusTasks()">
      <div class="flex flex-col gap-2.5">
        <div v-for="ft in ov.focusTasks" :key="ft.id" class="rounded-card p-3.5 bg-cream-100">
          <span class="text-xs px-2 py-0.5 rounded-full" :class="[ft.tagBg, ft.tagCol]">{{ ft.moduleLabel }}</span>
          <div class="text-sm font-medium text-ink-900 mt-2">{{ ft.title }}</div>
          <div class="h-1.5 rounded-full bg-cream-150 mt-2.5"><div class="h-full rounded-full bg-clay-500" :style="{ width: ft.progress + '%' }" /></div>
          <div class="flex items-center gap-1.5 mt-1.5 text-xs text-sand-500"><Icon name="calendar" :size="11" />{{ ft.due }}</div>
        </div>
      </div>
    </Modal>

    <!-- Goal detail modal -->
    <Modal
      v-if="ov.goalDetailModalOpen"
      :title="ov.goalDetailScope === 'week' ? '週目標詳細清單' : '月目標詳細清單'"
      :width="440"
      @close="ov.closeGoalDetailModal()"
    >
      <div v-if="ov.goalDetailScope === 'week'">
        <div class="text-xs font-medium text-clay-500 mb-2.5">週目標（{{ ov.weekGoalPct }}%）</div>
        <div class="flex flex-col gap-2.5">
          <div v-for="wi in ov.weekGoalItems" :key="wi.id" class="rounded-card p-3.5 bg-cream-100">
            <div class="text-sm font-medium text-ink-900">{{ wi.title }}</div>
            <div class="flex justify-between text-xs text-clay-500 mt-1"><span>{{ wi.daysLabel }}</span><span>{{ wi.pct }}%</span></div>
            <div class="h-1.5 rounded-full bg-cream-150 mt-1 overflow-hidden"><div class="h-full bg-clay-400" :style="{ width: wi.pct + '%' }" /></div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="text-xs font-medium text-brand-primary mb-2.5">月目標（{{ ov.monthGoalPct }}%）</div>
        <div class="flex flex-col gap-2.5">
          <div v-for="mi in ov.monthGoalItems" :key="mi.id" class="rounded-card p-3.5 bg-cream-100">
            <div class="text-sm font-medium text-ink-900">{{ mi.title }}</div>
            <div class="flex justify-between text-xs text-brand-primary mt-1"><span>{{ mi.daysLabel }}</span><span>{{ mi.pct }}%</span></div>
            <div class="h-1.5 rounded-full bg-cream-150 mt-1 overflow-hidden"><div class="h-full bg-brand-primary" :style="{ width: mi.pct + '%' }" /></div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Growth goal modal -->
    <Modal v-if="ov.growthGoalModalOpen" title="新增成長目標" :width="380" @close="ov.closeGrowthGoalModal()">
      <label class="text-xs font-medium text-ink-700">目標名稱</label>
      <input
        v-model="ov.growthGoalForm.title"
        placeholder="例：程式開發：複習 CSS Grid"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="ov.growthGoalTouched && !ov.growthGoalForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">說明（選填）</label>
      <input v-model="ov.growthGoalForm.sub" placeholder="例：每日 10 分鐘投資" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">標籤縮寫（選填，2 字）</label>
      <input v-model="ov.growthGoalForm.badgeText" placeholder="例：CSS" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <p v-if="ov.growthGoalTouched && !ov.growthGoalForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫目標名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="ov.closeGrowthGoalModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="ov.saveGrowthGoal()">儲存</button>
      </div>
    </Modal>

    <!-- Achievement modal -->
    <Modal v-if="ov.achievementModalOpen" title="新增今日小成就" :width="380" @close="ov.closeAchievementModal()">
      <label class="text-xs font-medium text-ink-700">內容</label>
      <input
        v-model="ov.achievementForm.text"
        placeholder="例：早餐喝了 2 公升的水"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="ov.achievementTouched && !ov.achievementForm.text.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <p v-if="ov.achievementTouched && !ov.achievementForm.text.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫內容</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="ov.closeAchievementModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="ov.saveAchievement()">儲存</button>
      </div>
    </Modal>
  </div>
</template>
