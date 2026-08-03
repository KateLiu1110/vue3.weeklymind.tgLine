<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore } from '@/stores/core'
import { useToeicStore } from '@/stores/toeic'
import Icon from '@/components/common/Icon.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import { themeColor } from '@/lib/themeColor'

const core = useCoreStore()
const toeic = useToeicStore()

const scoreDashoffset = computed(() => {
  const pct = Math.min(toeic.lastMockScore / toeic.targetScore, 1)
  return 264 - 264 * pct
})

const scoreTrendData = computed<ChartData<'bar'>>(() => ({
  labels: toeic.scoreTrend.map((b) => b.label),
  datasets: [
    {
      data: toeic.scoreTrend.map((b) => b.h),
      backgroundColor: toeic.scoreTrend.map((b) => themeColor(b.highlight ? 'clay-400' : 'sand-250')),
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
            <span class="font-medium text-ink-800" style="font-size: 22px">{{ toeic.lastMockScore }}</span>
            <span class="text-xs text-sand-500">/ {{ toeic.targetScore }} 分</span>
          </div>
        </div>
        <div class="flex-1">
          <div class="text-base font-medium text-ink-900">{{ toeic.goalTitle }}</div>
          <p class="mt-1.5 mb-0 text-xs text-sand-600 leading-relaxed">{{ toeic.goalDesc }}</p>
          <span class="inline-flex items-center gap-1.5 mt-2 bg-cream-100 text-clay-500 text-xs font-medium px-2.5 py-1 rounded-full">
            <Icon name="calendar" :size="12" />{{ toeic.classSchedule }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-ink-800">每日任務</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer">＋ 新增任務</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <div v-for="tt in toeic.tasks" :key="tt.id" class="rounded-card p-4 bg-cream-50 border border-cream-150 relative">
          <div class="flex items-center justify-between gap-1.5">
            <span class="flex items-center gap-2 min-w-0 overflow-hidden">
              <Icon :name="tt.iconKey" :size="16" class="text-clay-500" />
              <span class="text-sm font-medium text-ink-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ tt.title }}</span>
            </span>
            <span class="flex items-center gap-1.5 shrink-0">
              <span class="cursor-pointer text-sand-500 flex"><Icon name="edit" :size="13" /></span>
              <span class="cursor-pointer text-danger flex" @click="toeic.deleteTask(tt.id)"><Icon name="trash" :size="13" /></span>
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
            <div class="font-medium text-brand-primary" style="font-size: 17px">{{ core.streakDays }} 天</div>
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
          <span class="text-xs text-brand-primary font-medium cursor-pointer">＋ 新增</span>
        </div>
        <p v-if="toeic.examDates.length === 0" class="m-0 text-xs text-sand-400">尚未新增考試日期</p>
        <div v-else class="flex flex-col gap-3">
          <div v-for="ex in toeic.examDates" :key="ex.id" class="bg-cream-100 rounded-card p-3 relative">
            <span class="absolute top-2.5 right-2.5 cursor-pointer text-danger flex" @click="toeic.deleteExamDate(ex.id)">
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
          <span class="cursor-pointer text-sand-500 flex"><Icon name="edit" :size="14" /></span>
        </div>
        <div class="flex justify-between items-center py-2.5 border-b border-dashed border-cream-150">
          <span class="text-xs text-sand-600">上次模考</span>
          <span class="font-medium text-ink-900 text-base">{{ toeic.lastMockScore }} 分</span>
        </div>
        <div class="flex justify-between items-center pt-2.5">
          <span class="text-xs text-sand-600">本次目標</span>
          <span class="font-medium text-brand-primary text-base">{{ toeic.targetScore }} 分</span>
        </div>
      </div>
    </div>
  </div>
</template>
