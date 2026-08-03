<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useRetroStore } from '@/stores/retro'
import Icon from '@/components/common/Icon.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import { themeColor } from '@/lib/themeColor'

const retro = useRetroStore()
const isEmpty = retro.goals.length === 0

const weekBarData = computed<ChartData<'bar'>>(() => ({
  labels: retro.weekBars.map((b) => b.label),
  datasets: [
    {
      data: retro.weekBars.map((b) => b.h),
      backgroundColor: retro.weekBars.map((b) => themeColor(b.active ? 'brand-primary' : 'sand-250')),
      borderRadius: 4,
      maxBarThickness: 28,
    },
  ],
}))
const weekBarOptions: ChartOptions<'bar'> = {
  scales: {
    x: { grid: { display: false }, ticks: { color: themeColor('sand-500'), font: { size: 10 } } },
    y: { display: false },
  },
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}

const categoryPieData = computed<ChartData<'doughnut'>>(() => ({
  labels: retro.categoryShares.map((c) => c.name),
  datasets: [
    {
      data: retro.categoryShares.map((c) => c.value),
      backgroundColor: retro.categoryShares.map((c) => c.color),
      borderWidth: 0,
    },
  ],
}))
const categoryPieOptions: ChartOptions<'doughnut'> = {
  cutout: '68%',
  plugins: { legend: { display: false } },
}
</script>

<template>
  <div>
    <div v-if="isEmpty" class="rounded-card p-10 text-center text-sand-400 bg-cream-50 border border-cream-150">
      <Icon name="plusCircle" :size="30" class="mx-auto" />
      <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">新帳號尚無覆盤資料</p>
      <p class="m-0 text-xs text-sand-400">累積幾週打卡紀錄後，這裡會自動產生目標進度、達成率變化與分類佔比分析</p>
    </div>

    <template v-else>
      <div class="rounded-card p-5 mb-4 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3.5">
          <span class="text-sm font-medium text-ink-800">各項目標進度表</span>
          <span class="text-xs text-brand-primary font-medium cursor-pointer">＋ 新增目標</span>
        </div>
        <div class="flex flex-col gap-3.5">
          <div v-for="g in retro.goals" :key="g.id">
            <div class="flex justify-between text-xs text-ink-700 mb-1">
              <span>{{ g.title }}</span>
              <span class="flex items-center gap-2">
                {{ g.label }}
                <span class="cursor-pointer text-danger flex" @click="retro.deleteGoal(g.id)"><Icon name="trash" :size="13" /></span>
              </span>
            </div>
            <div class="h-2.5 rounded-full bg-cream-150 relative overflow-hidden">
              <div class="h-full rounded-full" :style="{ width: g.pct + '%', background: g.color }" />
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="text-sm font-medium text-ink-800 mb-3">本週達成率變化</div>
        <ChartCanvas type="bar" :data="weekBarData" :options="weekBarOptions" :height="130" />
      </div>

      <div class="rounded-card p-5 mt-4 flex items-center gap-7 flex-wrap bg-cream-50 border border-cream-150">
        <div>
          <div class="text-sm font-medium text-ink-800 mb-3.5">各分類達成率佔比</div>
          <div class="w-[150px] h-[150px] relative">
            <ChartCanvas type="doughnut" :data="categoryPieData" :options="categoryPieOptions" :height="150" />
            <div class="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span class="font-medium text-brand-primary" style="font-size: 20px">{{ retro.pieTotalPct }}%</span>
              <span class="text-xs text-sand-500">整體達成</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2.5 flex-1 min-w-[180px]">
          <div v-for="c in retro.categoryShares" :key="c.id" class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded shrink-0" :style="{ background: c.color }" />
            <span class="flex-1 text-sm text-ink-900">{{ c.name }}</span>
            <span class="text-xs font-medium text-ink-700">{{ c.value }}%</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
