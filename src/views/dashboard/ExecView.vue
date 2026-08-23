<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore, type Plan } from '@/stores/core'
import { useExecStore } from '@/stores/exec'
import { usePlanMutations } from '@/composables/usePlans'
import { useStreak } from '@/composables/useStreak'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/common/Icon.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import Modal from '@/components/common/Modal.vue'
import { themeColor } from '@/lib/themeColor'

const core = useCoreStore()
const exec = useExecStore()
const auth = useAuthStore()
const router = useRouter()
const { checkinPlanMutation } = usePlanMutations()
const streakQuery = useStreak()
const streakDays = computed(() => streakQuery.data.value ?? 0)

function checkin(planId: string) {
  if (!auth.requireLogin()) return
  checkinPlanMutation.mutate(planId)
}

/** 卡片底下還沒有任務時，「新增任務」直接帶去該計畫的編輯頁——沿用那裡既有的
 * 新增任務彈窗（依模板種類開對應的那一個），不在執行中心另外做一套。新增完、
 * 回到這裡卡片就會因為 planTaskCount(p) > 0 自動變成可打卡狀態。 */
function addTaskFor(plan: Plan) {
  if (!auth.requireLogin()) return
  if (!plan.linkedCustomId) return
  const mod = core.customModules.find((m) => m.id === plan.linkedCustomId)
  core.setCustomTab(plan.linkedCustomId)
  if (mod?.kind === 'goal') core.openDailyTaskModal()
  else if (mod?.kind === 'tab') core.openTabItemModal()
  else if (mod?.kind === 'board') core.openBoardModal()
  router.push({ name: 'custom', params: { id: plan.linkedCustomId } })
}

/** 計畫剛新增、底下自訂模組還沒填任何任務時，不該讓人打卡（沒有東西可以打——跟
 * LINE 每日卡片的邏輯一致，見 services/line.ts 的 getCheckListFlex 動態區塊：
 * 空模組顯示提示文字，不是打卡按鈕）。 */
function planTaskCount(plan: Plan): number {
  const mod = core.customModules.find((m) => m.id === plan.linkedCustomId)
  if (!mod) return 0
  if (mod.kind === 'goal') return mod.dailyTasks.length
  if (mod.kind === 'tab') return mod.tabCats.reduce((sum, c) => sum + c.items.length, 0)
  if (mod.kind === 'board') return mod.boardColumns.reduce((sum, c) => sum + c.items.length, 0)
  return 0
}

const hasExecData = computed(() => core.plans.length > 0 || exec.todayTasks.length > 0)
const selectedDateLabel = computed(() => exec.weekDays.find((d) => d.index === exec.selectedDay)?.date ?? dayjs().format('M/D'))

const monthlyReport = computed(() => [
  ...core.plans.map((p) => ({ month: '進行中', title: p.title, summary: p.sub, pct: p.pct })),
  ...core.milestones.map((m) => ({ month: '里程碑', title: m.title, summary: m.desc, pct: m.progress })),
])

const radarData = computed<ChartData<'radar'>>(() => ({
  labels: exec.radarSkills.map((s) => s.label),
  datasets: [
    {
      data: exec.radarSkills.map((s) => s.value),
      backgroundColor: themeColor('brand-primary') + 'd9',
      borderColor: themeColor('brand-primary'),
      borderWidth: 1.5,
      pointRadius: 0,
    },
  ],
}))
const radarOptions: ChartOptions<'radar'> = {
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { display: false },
      grid: { color: themeColor('sand-200') },
      angleLines: { color: themeColor('sand-200') },
      pointLabels: { font: { size: 10 }, color: themeColor('ink-700') },
    },
  },
  plugins: { legend: { display: false } },
}

const stageBarData = computed<ChartData<'bar'>>(() => ({
  labels: exec.stageBars.map((b) => b.label),
  datasets: [
    {
      data: exec.stageBars.map((b) => b.h),
      backgroundColor: exec.stageBars.map((b) => themeColor(b.active ? 'brand-primary' : 'cream-150')),
      borderRadius: 4,
      maxBarThickness: 22,
    },
  ],
}))
const stageBarOptions: ChartOptions<'bar'> = {
  scales: {
    x: { grid: { display: false }, ticks: { color: themeColor('sand-500'), font: { size: 10 } } },
    y: { display: false },
  },
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
    <div v-if="!hasExecData" class="rounded-card p-10 text-center text-sand-400 bg-cream-50 border border-cream-150">
      <Icon name="plusCircle" :size="30" class="mx-auto" />
      <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚無執行資料</p>
      <p class="m-0 text-xs text-sand-400">在「計劃管理」新增專注任務、里程碑或計畫後，這裡會自動產生每日進度、配速與分類統計</p>
    </div>

    <div v-else class="rounded-card p-5 bg-cream-50 border border-cream-150 min-w-0">
      <div class="flex items-center justify-between mb-3">
        <span class="flex items-center gap-1.5 text-sm font-medium text-ink-800">
          <Icon name="calendar" :size="17" class="text-brand-primary" />訓練計畫
        </span>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium bg-cream-100 text-clay-500 px-2.5 py-1 rounded-full">第 {{ exec.weekNumber }} 週</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full flex items-center justify-center text-sand-500 hover:bg-cream-100 cursor-pointer"
            title="查看日期"
            @click="exec.openDateModal()"
          >
            <Icon name="more" :size="16" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="d in exec.weekDays"
          :key="d.index"
          class="flex flex-col items-center gap-4 rounded-2xl py-4.5 px-1.5 cursor-pointer border-2"
          :class="[
            d.isToday ? 'bg-forest-alt border-transparent shadow-md' : 'bg-cream-185',
            d.dashedBorder ? 'border-dashed border-sage-pale' : !d.isToday ? 'border-transparent' : '',
          ]"
          @click="exec.selectDay(d.index)"
        >
          <span class="text-xs" :class="d.isToday ? 'text-mint-pale font-medium' : 'text-brand-secondary-muted'">{{ d.label }}</span>
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center"
            :class="[
              d.isToday ? 'bg-transparent' : d.colorway === 'sage' ? 'bg-sage-accent' : d.colorway === 'peach' ? 'bg-peach-soft' : 'bg-transparent',
            ]"
          >
            <Icon
              :name="d.icon"
              :size="d.icon === 'moon' || d.icon === 'leaf' ? 20 : 24"
              :class="d.isToday ? 'text-white' : d.isRest ? 'text-stone-muted' : 'text-ink-950'"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 bg-cream-90 rounded-card p-4">
        <div class="text-sm font-medium text-ink-800 mb-3">任務清單（{{ exec.todayLabel }}）</div>
        <p v-if="exec.todayTasks.length === 0" class="m-0 text-xs text-sand-400">這天沒有排定的任務</p>
        <div v-else class="flex flex-col gap-2.5">
          <div
            v-for="t in exec.todayTasks"
            :key="t.id"
            class="flex items-center gap-2.5 text-sm cursor-pointer"
            :class="t.done ? 'text-sand-400' : 'text-ink-900'"
            @click="exec.toggleTask(t.key)"
          >
            <span
              class="w-4.5 h-4.5 rounded-md shrink-0 flex items-center justify-center text-white text-xs font-medium"
              :class="t.done ? 'bg-brand-primary' : 'border-2 border-sand-250'"
            >
              <span v-if="t.done">✓</span>
            </span>
            <span :class="t.done ? 'line-through' : ''">{{ t.title }}</span>
          </div>
        </div>
      </div>

      <div class="flex gap-3.5 mt-4.5 flex-col sm:flex-row">
        <div class="flex-1 bg-cream-75 border border-cream-150 rounded-card p-3.5">
          <div class="text-xs font-medium text-ink-800 mb-2">核心能力雷達圖</div>
          <ChartCanvas type="radar" :data="radarData" :options="radarOptions" :height="150" />
        </div>
        <div class="flex-1 bg-cream-75 border border-cream-150 rounded-card p-3.5 flex flex-col">
          <div class="flex items-center justify-between mb-3.5">
            <span class="text-xs font-medium text-ink-800">本週階段進度</span>
            <span
              class="flex items-center gap-1 text-xs text-brand-primary font-medium cursor-pointer whitespace-nowrap"
              @click="exec.openMonthlyReport()"
            >
              <Icon name="book" :size="11" />每月計畫表 →
            </span>
          </div>
          <ChartCanvas type="bar" :data="stageBarData" :options="stageBarOptions" :height="96" />
        </div>
      </div>

      <div class="flex gap-3.5 mt-4.5">
        <div class="flex-1 bg-cream-125 rounded-card p-3">
          <div class="font-medium text-ink-800" style="font-size: 19px">{{ exec.scheduledCount }}</div>
          <div class="text-xs text-sand-500 mt-0.5">本週已排程次數</div>
        </div>
        <div class="flex-1 bg-cream-125 rounded-card p-3">
          <div class="font-medium text-ink-800" style="font-size: 19px">{{ exec.checkedGoalsCount }}</div>
          <div class="text-xs text-sand-500 mt-0.5">已完成打卡項目</div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-5">
        <span class="text-xs font-medium text-ink-800">分類每日進度</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="exec.openExecCatModal()">＋ 新增分類</span>
      </div>
      <p v-if="exec.catProgress.length === 0" class="m-0 mt-2.5 text-xs text-sand-400">尚無分類，點擊「＋ 新增分類」建立第一筆</p>
      <div v-else class="flex flex-col gap-2.5 mt-2.5">
        <div v-for="c in exec.catProgress" :key="c.id">
          <div class="flex justify-between items-center text-xs text-ink-700 mb-1">
            <span>{{ c.name }}</span>
            <span class="flex items-center gap-2">
              {{ c.value }}%
              <span v-if="c.auto" class="text-xs text-sand-400">自動</span>
              <span v-else class="cursor-pointer text-danger flex" @click="exec.removeCategory(c.id)"><Icon name="trash" :size="13" /></span>
            </span>
          </div>
          <div class="h-1.5 rounded-full bg-cream-150 overflow-hidden">
            <div class="h-full" :style="{ width: c.value + '%', background: c.color }" />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-5 mb-3">
        <span class="flex items-center gap-1.5 text-xs font-medium text-ink-800">
          <Icon name="clock" :size="14" class="text-brand-primary" />今日時程表
        </span>
        <span class="text-xs text-sand-500">{{ selectedDateLabel }}</span>
      </div>
      <p v-if="exec.selectedDayScheduleBlocks.length === 0" class="m-0 text-xs text-sand-400">這天沒有排定時段的計畫</p>
      <div v-else class="overflow-x-auto">
        <div class="flex items-start min-w-max">
          <template v-for="(b, i) in exec.selectedDayScheduleBlocks" :key="b.id">
            <div
              v-if="i > 0"
              class="w-6 sm:w-10 h-px mt-[7px] shrink-0"
              :class="exec.selectedDayScheduleBlocks[i - 1].status !== 'upcoming' ? 'bg-brand-primary' : 'bg-cream-150'"
            />
            <div class="flex flex-col items-center text-center w-24 shrink-0 cursor-pointer" @click="exec.toggleTask(b.key)">
              <span
                class="w-3.5 h-3.5 rounded-full border-2 shrink-0"
                :class="[
                  b.status === 'active' ? 'bg-brand-primary border-brand-primary' : '',
                  b.status === 'done' ? 'bg-brand-primary border-brand-primary' : '',
                  b.status === 'upcoming' ? 'bg-white border-sand-250' : '',
                ]"
              />
              <div class="mt-2 text-xs" :class="b.status !== 'upcoming' ? 'text-brand-primary font-medium' : 'text-sand-500'">
                {{ b.startTime }} - {{ b.endTime }}
              </div>
              <div
                class="text-sm mt-0.5 px-0.5"
                :class="[
                  b.status === 'active' ? 'font-medium text-ink-900' : '',
                  b.status === 'done' ? 'text-brand-primary' : '',
                  b.status === 'upcoming' ? 'text-ink-700' : '',
                ]"
              >
                {{ b.title }}
              </div>
              <span v-if="b.status === 'done'" class="inline-block mt-1 text-xs text-brand-primary">已完成</span>
              <span v-else-if="b.status === 'active'" class="inline-block mt-1 text-xs text-clay-500 italic">進行中</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3.5 min-w-0">
      <div class="bg-gold-accent rounded-card px-5 py-7 text-center relative overflow-hidden shadow">
        <div class="flex items-center justify-center gap-2">
          <Icon name="fire" :size="24" class="text-ink-amber" />
          <span class="font-medium text-ink-amber whitespace-nowrap" style="font-size: 22px">連續 {{ streakDays }} 天</span>
        </div>
        <p class="mt-2 text-sm font-medium text-ink-amber/80 leading-relaxed">保持運動與學習節奏！</p>
      </div>

      <template v-if="core.plans.length > 0">
        <div v-for="p in core.plans" :key="p.id" class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
          <div class="flex items-center justify-between mb-2.5 gap-2">
            <div class="min-w-0">
              <div class="text-sm font-medium text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ p.title }}</div>
              <div class="text-xs text-stone-400 mt-0.5">{{ p.sub }}</div>
            </div>
            <span class="text-xs font-medium text-brand-primary shrink-0">{{ p.pct }}%</span>
          </div>
          <div class="h-1.5 rounded-full bg-cream-150 mt-3">
            <div class="h-full rounded-full" :style="{ width: p.pct + '%', background: p.color }" />
          </div>
          <button
            v-if="planTaskCount(p) > 0"
            type="button"
            class="w-full flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-control bg-brand-primary text-white text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="checkinPlanMutation.isPending.value"
            @click="checkin(p.id)"
          >
            <Icon v-if="checkinPlanMutation.isPending.value" name="refresh" :size="12" class="animate-spin" />
            ✓ 今日打卡（已 {{ p.checkinsDone }} 次）
          </button>
          <button
            v-else
            type="button"
            class="w-full flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-control border border-dashed border-sand-250 text-brand-primary text-xs font-medium cursor-pointer"
            @click="addTaskFor(p)"
          >
            ＋ 新增任務
          </button>
        </div>
      </template>
      <div v-else class="rounded-card p-6.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚無執行中的計畫</p>
        <p class="m-0 text-xs text-sand-400">在「計畫中心」新增計畫後，任務會自動顯示在這裡</p>
      </div>
    </div>

    <Modal v-if="exec.execCatModalOpen" title="新增追蹤分類" :width="380" @close="exec.closeExecCatModal()">
      <label class="text-xs font-medium text-ink-700">分類名稱</label>
      <input
        v-model="exec.execCatForm.name"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="exec.execCatTouched && !exec.execCatForm.name.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">目前進度 %</label>
      <input
        v-model="exec.execCatForm.value"
        type="number"
        min="0"
        max="100"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
      />
      <p v-if="exec.execCatTouched && !exec.execCatForm.name.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫分類名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="exec.closeExecCatModal()">
          取消
        </button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="exec.saveExecCat()">
          儲存
        </button>
      </div>
    </Modal>

    <Modal v-if="exec.monthlyReportOpen" title="每月計畫表" :width="520" @close="exec.closeMonthlyReport()">
      <p class="m-0 mb-4 text-xs text-sand-500">系統最多保存近 3–6 個月的打卡紀錄，供覆盤與趨勢分析使用</p>
      <div v-if="monthlyReport.length > 0" class="flex flex-col gap-2.5">
        <div v-for="(m, i) in monthlyReport" :key="i" class="rounded-card p-3.5 flex items-center gap-3.5 bg-cream-100">
          <div class="w-11 h-11 rounded-xl bg-cream-50 flex items-center justify-center text-xs font-medium text-clay-500 shrink-0 text-center">
            {{ m.month }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-ink-900">{{ m.title }}</div>
            <div class="text-xs text-sand-500 mt-0.5">{{ m.summary }}</div>
          </div>
          <div class="text-right shrink-0">
            <div class="font-medium text-brand-primary" style="font-size: 16px">{{ m.pct }}%</div>
            <div class="text-xs text-sand-500">完成率</div>
          </div>
        </div>
      </div>
      <p v-else class="m-0 text-xs text-sand-400">尚無計畫或里程碑資料，先到計劃管理新增</p>
    </Modal>

    <Modal v-if="exec.dateModalOpen" title="訓練計畫詳情" :width="640" @close="exec.closeDateModal()">
      <div class="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-5">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-ink-800">{{ exec.dateModalMonthLabel }}</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="w-7 h-7 rounded-full flex items-center justify-center text-sand-500 hover:bg-cream-100 cursor-pointer"
                @click="exec.prevDateModalMonth()"
              >
                <Icon name="chevronLeft" :size="16" />
              </button>
              <button
                type="button"
                class="w-7 h-7 rounded-full flex items-center justify-center text-sand-500 hover:bg-cream-100 cursor-pointer"
                @click="exec.nextDateModalMonth()"
              >
                <Icon name="chevronRight" :size="16" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-xs text-sand-400 mb-1.5">
            <span v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w">{{ w }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="d in exec.dateModalCalendarDays"
              :key="d.key"
              type="button"
              class="aspect-square rounded-full text-xs flex items-center justify-center cursor-pointer"
              :class="[
                d.isSelected
                  ? 'bg-brand-primary text-white font-medium'
                  : d.isToday
                    ? 'border border-brand-primary text-brand-primary font-medium'
                    : d.inMonth
                      ? 'text-ink-800 hover:bg-cream-100'
                      : 'text-sand-250',
              ]"
              @click="exec.selectDateModalDate(d.dateStr)"
            >
              {{ d.day }}
            </button>
          </div>
        </div>

        <div>
          <div class="text-sm font-medium text-ink-800 mb-3">{{ exec.dateModalSelectedLabel }}</div>
          <p v-if="exec.dateModalTasks.length === 0" class="m-0 text-xs text-sand-400">這天沒有排定的任務</p>
          <div v-else class="flex flex-col gap-2.5">
            <div
              v-for="t in exec.dateModalTasks"
              :key="t.id"
              class="flex items-center gap-2.5 text-sm cursor-pointer"
              :class="t.done ? 'text-sand-400' : 'text-ink-900'"
              @click="exec.toggleTask(t.key)"
            >
              <span
                class="w-4.5 h-4.5 rounded-md shrink-0 flex items-center justify-center text-white text-xs font-medium"
                :class="t.done ? 'bg-brand-primary' : 'border-2 border-sand-250'"
              >
                <span v-if="t.done">✓</span>
              </span>
              <span :class="t.done ? 'line-through' : ''">{{ t.title }}</span>
            </div>
          </div>

          <div v-if="exec.dateModalTasks.length > 0" class="mt-4 bg-cream-90 rounded-card p-3 text-xs text-ink-700 flex items-start gap-2">
            <Icon name="chat" :size="14" class="text-brand-primary mt-0.5 shrink-0" />
            <span>「{{ exec.dateModalQuote }}」</span>
          </div>
        </div>
      </div>

      <div class="flex gap-2.5 mt-5">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="exec.closeDateModal()">
          關閉
        </button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="exec.dateModalTasks.length === 0"
          @click="exec.confirmDateCheckin()"
        >
          確認打卡
        </button>
      </div>
    </Modal>
  </div>
</template>
