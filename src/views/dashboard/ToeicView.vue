<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useToeicStore } from '@/stores/toeic'
import { useToeicPage, useToeicMutations } from '@/composables/useToeic'
import { useStreak } from '@/composables/useStreak'
import Icon from '@/components/common/Icon.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import Modal from '@/components/common/Modal.vue'
import { themeColor } from '@/lib/themeColor'

const toeic = useToeicStore()
const pageQuery = useToeicPage()
const { updateProfileMutation, createExamDateMutation, deleteExamDateMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation } =
  useToeicMutations()
const streakQuery = useStreak()
const streakDays = computed(() => streakQuery.data.value ?? 0)

const profile = computed(
  () =>
    pageQuery.data.value?.profile ?? {
      goalTitle: '多益目標 600 分',
      goalDesc: '',
      classSchedule: '',
      lastMockScore: 0,
      targetScore: 0,
      scoreTrend: [] as { label: string; h: number; highlight: boolean }[],
    },
)
const examDates = computed(() =>
  (pageQuery.data.value?.examDates ?? []).map((ex) => ({ ...ex, daysLeft: Math.max(dayjs(ex.date).diff(dayjs(), 'day'), 0) })),
)
const tasks = computed(() =>
  (pageQuery.data.value?.tasks ?? []).map((t) => ({
    ...t,
    statusLabel: t.done ? '✓ 已打卡' : '待完成',
  })),
)

const scoreDashoffset = computed(() => {
  const pct = profile.value.targetScore ? Math.min(profile.value.lastMockScore / profile.value.targetScore, 1) : 0
  return 264 - 264 * pct
})

const scoreTrendData = computed<ChartData<'bar'>>(() => ({
  labels: profile.value.scoreTrend.map((b) => b.label),
  datasets: [
    {
      data: profile.value.scoreTrend.map((b) => b.h),
      backgroundColor: profile.value.scoreTrend.map((b) => themeColor(b.highlight ? 'clay-400' : 'sand-250')),
      borderRadius: 4,
      maxBarThickness: 40,
    },
  ],
}))
const scoreTrendOptions: ChartOptions<'bar'> = {
  scales: {
    x: { grid: { display: false }, ticks: { color: themeColor('sand-500'), font: { size: 10 } } },
    y: { display: false },
  },
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}

function submitTask() {
  if (!toeic.taskForm.title.trim()) {
    toeic.taskTouched = true
    return
  }
  const pct = Math.min(100, Math.max(0, Number(toeic.taskForm.pct) || 0))
  if (toeic.taskEditId) {
    updateTaskMutation.mutate({
      id: toeic.taskEditId,
      input: { title: toeic.taskForm.title.trim(), todayLabel: toeic.taskForm.todayLabel.trim(), pct, done: pct >= 100 },
    })
  } else {
    createTaskMutation.mutate({ title: toeic.taskForm.title.trim(), todayLabel: toeic.taskForm.todayLabel.trim(), pct, iconKey: 'goal' })
  }
  toeic.taskModalOpen = false
}

function submitExamDate() {
  if (!toeic.examForm.title.trim() || !toeic.examForm.date) {
    toeic.examTouched = true
    return
  }
  createExamDateMutation.mutate({ title: toeic.examForm.title.trim(), date: toeic.examForm.date })
  toeic.examModalOpen = false
}

function submitScore() {
  updateProfileMutation.mutate({
    lastMockScore: Number(toeic.scoreForm.lastMockScore) || 0,
    targetScore: Number(toeic.scoreForm.targetScore) || 0,
  })
  toeic.scoreModalOpen = false
}
</script>

<template>
  <div class="flex gap-4.5 items-start flex-col xl:flex-row">
    <div class="flex-1 min-w-0 w-full">
      <div class="rounded-card p-5.5 flex items-center gap-5.5 mb-4.5 bg-cream-50 border border-cream-150">
        <div class="relative w-25 h-25 shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" style="transform: rotate(-90deg)">
            <circle cx="50" cy="50" r="42" fill="none" class="stroke-cream-150" stroke-width="11" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              class="stroke-clay-400"
              stroke-width="11"
              stroke-linecap="round"
              stroke-dasharray="264"
              :stroke-dashoffset="scoreDashoffset"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-medium text-ink-800" style="font-size: 22px">{{ profile.lastMockScore }}</span>
            <span class="text-xs text-sand-500">/ {{ profile.targetScore }} 分</span>
          </div>
        </div>
        <div class="flex-1">
          <div class="text-base font-medium text-ink-900">{{ profile.goalTitle }}</div>
          <p class="mt-1.5 mb-0 text-xs text-sand-600 leading-relaxed">{{ profile.goalDesc }}</p>
          <span v-if="profile.classSchedule" class="inline-flex items-center gap-1.5 mt-2 bg-cream-100 text-clay-500 text-xs font-medium px-2.5 py-1 rounded-full">
            <Icon name="calendar" :size="12" />{{ profile.classSchedule }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-ink-800">每日任務</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="toeic.openTaskModal()">＋ 新增任務</span>
      </div>
      <div v-if="tasks.length === 0" class="rounded-card p-6 mb-3.5 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <p class="m-0 text-xs font-medium text-sand-600">尚未建立任何每日任務</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <div v-for="tt in tasks" :key="tt.id" class="rounded-card p-4 bg-cream-50 border border-cream-150 relative">
          <div class="flex items-center justify-between gap-1.5">
            <span class="flex items-center gap-2 min-w-0 overflow-hidden">
              <Icon :name="tt.iconKey" :size="16" class="text-clay-500" />
              <span class="text-sm font-medium text-ink-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ tt.title }}</span>
            </span>
            <span class="flex items-center gap-1.5 shrink-0">
              <span class="cursor-pointer text-sand-500 flex" @click="toeic.openTaskModal(tt)"><Icon name="edit" :size="13" /></span>
              <span class="cursor-pointer text-danger flex" @click="deleteTaskMutation.mutate(tt.id)"><Icon name="trash" :size="13" /></span>
            </span>
          </div>
          <div class="text-xs text-sand-500 mt-1.5">{{ tt.todayLabel }}</div>
          <div class="h-1.5 rounded-full bg-cream-150 mt-2">
            <div class="h-full rounded-full" :class="tt.done ? 'bg-brand-primary' : 'bg-clay-400'" :style="{ width: tt.pct + '%' }" />
          </div>
          <div class="flex items-center gap-1.5 mt-2 text-xs font-medium" :class="tt.done ? 'text-brand-primary' : 'text-clay-500'">
            {{ tt.statusLabel }}
          </div>
        </div>
        <div class="rounded-card p-4 flex items-center justify-center gap-2 bg-cream-100">
          <Icon name="fire" :size="22" class="text-brand-primary" />
          <div>
            <div class="font-medium text-brand-primary" style="font-size: 17px">{{ streakDays }} 天</div>
            <div class="text-xs text-sand-500">英文連續打卡</div>
          </div>
        </div>
      </div>

      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="text-sm font-medium text-ink-800 mb-2.5">分數趨勢</div>
        <ChartCanvas type="bar" :data="scoreTrendData" :options="scoreTrendOptions" :height="120" />
      </div>
    </div>

    <div class="w-full xl:w-60 shrink-0">
      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3">
          <span class="flex items-center gap-1.5 text-sm font-medium text-ink-800"><Icon name="calendar" :size="14" />考試天數</span>
          <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="toeic.openExamModal()">＋ 新增</span>
        </div>
        <p v-if="examDates.length === 0" class="m-0 text-xs text-sand-400">尚未新增考試日期</p>
        <div v-else class="flex flex-col gap-3">
          <div v-for="ex in examDates" :key="ex.id" class="bg-cream-100 rounded-card p-3 relative">
            <span class="absolute top-2.5 right-2.5 cursor-pointer text-danger flex" @click="deleteExamDateMutation.mutate(ex.id)">
              <Icon name="trash" :size="13" />
            </span>
            <div class="text-xs font-medium text-ink-900 pr-4">{{ ex.title }}</div>
            <div class="text-xs text-sand-500 mt-0.5">{{ ex.date }}</div>
            <div class="font-medium text-brand-primary mt-1.5" style="font-size: 20px">
              {{ ex.daysLeft }} <span class="text-xs font-medium text-clay-500">天後</span>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-card p-4.5 mt-3.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-ink-800">模考分數</span>
          <span class="cursor-pointer text-sand-500 flex" @click="toeic.openScoreModal(profile.lastMockScore, profile.targetScore)">
            <Icon name="edit" :size="14" />
          </span>
        </div>
        <div class="flex justify-between items-center py-2.5 border-b border-dashed border-cream-150">
          <span class="text-xs text-sand-600">上次模考</span>
          <span class="font-medium text-ink-900 text-base">{{ profile.lastMockScore }} 分</span>
        </div>
        <div class="flex justify-between items-center pt-2.5">
          <span class="text-xs text-sand-600">本次目標</span>
          <span class="font-medium text-brand-primary text-base">{{ profile.targetScore }} 分</span>
        </div>
      </div>
    </div>

    <Modal v-if="toeic.taskModalOpen" :title="toeic.taskModalTitle" :width="380" @close="toeic.closeTaskModal()">
      <label class="text-xs font-medium text-ink-700">任務名稱</label>
      <input
        v-model="toeic.taskForm.title"
        placeholder="例：聽力練習"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="toeic.taskTouched && !toeic.taskForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">今日進度說明</label>
      <input
        v-model="toeic.taskForm.todayLabel"
        placeholder="例：今日 0 / 1 篇"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
      />
      <label class="text-xs font-medium text-ink-700">完成度 (%)</label>
      <input
        v-model="toeic.taskForm.pct"
        type="number"
        min="0"
        max="100"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
      />
      <p v-if="toeic.taskTouched && !toeic.taskForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫任務名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="toeic.closeTaskModal()">
          取消
        </button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="submitTask">
          儲存
        </button>
      </div>
    </Modal>

    <Modal v-if="toeic.examModalOpen" title="新增考試日期" :width="360" @close="toeic.closeExamModal()">
      <label class="text-xs font-medium text-ink-700">考試名稱</label>
      <input
        v-model="toeic.examForm.title"
        placeholder="例：多益公開測驗"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="toeic.examTouched && !toeic.examForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">考試日期</label>
      <input
        v-model="toeic.examForm.date"
        type="date"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="toeic.examTouched && !toeic.examForm.date ? 'border-coral' : 'border-sand-200'"
      />
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="toeic.closeExamModal()">
          取消
        </button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="submitExamDate">
          儲存
        </button>
      </div>
    </Modal>

    <Modal v-if="toeic.scoreModalOpen" title="編輯模考分數" :width="360" @close="toeic.closeScoreModal()">
      <label class="text-xs font-medium text-ink-700">上次模考分數</label>
      <input v-model="toeic.scoreForm.lastMockScore" type="number" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">本次目標分數</label>
      <input v-model="toeic.scoreForm.targetScore" type="number" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="toeic.closeScoreModal()">
          取消
        </button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="submitScore">
          儲存
        </button>
      </div>
    </Modal>
  </div>
</template>
