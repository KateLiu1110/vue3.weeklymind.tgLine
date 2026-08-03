<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useCoreStore } from '@/stores/core'
import { useOverviewStore } from '@/stores/overview'
import Icon from '@/components/common/Icon.vue'

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

const pieColors = ['brand-primary', 'clay-400', 'link-blue']
const plansPieLegend = computed(() =>
  core.plans.slice(0, 3).map((p, i) => ({ name: p.title, colorClass: `bg-${pieColors[i % pieColors.length]}` })),
)
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
          <div class="w-20 h-20 rounded-2xl bg-cream-100 flex items-center justify-center text-4xl shrink-0">🐾</div>
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
              <span class="w-2.5 h-2.5 rounded shrink-0" :class="lg.colorClass" />{{ lg.name }}
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
          <span class="text-xs text-brand-primary font-medium cursor-pointer whitespace-nowrap">＋ 新增</span>
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
      <div class="mt-2 mb-2.5 text-sm font-medium text-ink-800">
        里程碑<span class="text-xs text-sand-400 font-normal ml-2">（打卡完成的目標）</span>
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
          <div class="w-9.5 h-9.5 rounded-xl bg-cream-100 flex items-center justify-center text-lg shrink-0">🐾</div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ ms.title }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full shrink-0 ml-1.5" :style="{ background: ms.tagBg, color: ms.tagCol }">{{ ms.tag }}</span>
            </div>
            <p class="my-1.5 text-xs text-sand-500">{{ ms.desc }}</p>
            <div class="relative h-4.5 rounded-full bg-cream-175 overflow-hidden">
              <div class="absolute inset-0 rounded-full" :style="{ width: ms.progress + '%', background: ms.color }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <div>
      <div class="flex items-center justify-between mt-1.5 mb-2.5">
        <span class="text-sm font-medium text-ink-800">進行中的計畫</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer">查看全部 →</span>
      </div>
      <div v-if="core.plans.length === 0" class="rounded-card p-5.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2 mb-0.5 text-xs font-medium text-sand-600">尚未有進行中的計畫</p>
        <p class="my-0 text-xs text-sand-400">新增第一筆計畫</p>
        <button type="button" class="mt-3 inline-flex items-center gap-1.5 bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer">
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
        <span class="text-xs text-brand-primary font-medium cursor-pointer">查看全部 →</span>
      </div>
      <div v-if="ov.focusTasks.length === 0" class="rounded-card p-6.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚未建立任何專注任務</p>
        <p class="my-0 text-xs text-sand-400">新增第一個任務，開始追蹤你的計畫</p>
        <button type="button" class="mt-3 inline-flex items-center gap-1.5 bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer">
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
  </div>
</template>
