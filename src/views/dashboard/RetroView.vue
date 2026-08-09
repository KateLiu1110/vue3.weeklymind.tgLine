<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useRetroStore } from '@/stores/retro'
import { useRetroGoals, useRetroMutations } from '@/composables/useRetro'
import { useAuthStore } from '@/stores/auth'
import type { ApiBusinessError } from '@/api/transport/apiBusinessError'
import Icon from '@/components/common/Icon.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import Modal from '@/components/common/Modal.vue'
import LockedFeature from '@/components/common/LockedFeature.vue'
import { themeColor } from '@/lib/themeColor'

const retro = useRetroStore()
const auth = useAuthStore()
const goalsQuery = useRetroGoals()
const { createGoalMutation, deleteGoalMutation } = useRetroMutations()

const isLocked = computed(
  () => !auth.isLoggedIn || (goalsQuery.error.value as ApiBusinessError | null)?.code === 'FEATURE_LOCKED',
)
const isEmpty = computed(() => (goalsQuery.data.value ?? []).length === 0)

const goalsDisplay = computed(() =>
  (goalsQuery.data.value ?? []).map((g) => {
    const elapsedDays = Math.max(dayjs().diff(dayjs(g.start), 'day'), 0)
    if (g.totalDays) {
      const pct = Math.min(100, Math.round((elapsedDays / g.totalDays) * 100))
      return { ...g, pct, label: `預計 ${g.totalDays} 天・目前第 ${elapsedDays + 1} 天` }
    }
    return { ...g, pct: Math.min(100, Math.round((elapsedDays / (52 * 7)) * 100)), label: `持續進行・已 ${elapsedDays} 天` }
  }),
)

function submitGoal() {
  if (!retro.retroGoalForm.title.trim() || !retro.retroGoalForm.start) {
    retro.retroGoalTouched = true
    return
  }
  createGoalMutation.mutate({
    title: retro.retroGoalForm.title.trim(),
    start: retro.retroGoalForm.start,
    totalDays: retro.retroGoalForm.totalDays ? Number(retro.retroGoalForm.totalDays) : null,
    color: retro.nextColor((goalsQuery.data.value ?? []).length),
  })
  retro.closeRetroGoalModal()
}

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
    <LockedFeature
      v-if="isLocked"
      title="覆盤中心尚未解鎖"
      :hint="!auth.isLoggedIn ? '登入並累積 5 次打卡即可解鎖' : '累積 5 次打卡（網頁或 LINE 都算）即可解鎖這個工具'"
    />
    <template v-else>
      <div v-if="isEmpty" class="rounded-card p-10 text-center text-sand-400 bg-cream-50 border border-cream-150">
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚無覆盤目標</p>
        <p class="m-0 text-xs text-sand-400">按下面「＋ 新增目標」開始追蹤第一個長期目標</p>
        <button
          type="button"
          class="mt-3 inline-flex items-center gap-1.5 bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer"
          @click="retro.openRetroGoalModal()"
        >
          ＋ 新增目標
        </button>
      </div>

      <template v-else>
        <div class="rounded-card p-5 mb-4 bg-cream-50 border border-cream-150">
          <div class="flex items-center justify-between mb-3.5">
            <span class="text-sm font-medium text-ink-800">各項目標進度表</span>
            <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="retro.openRetroGoalModal()">＋ 新增目標</span>
          </div>
          <div class="flex flex-col gap-3.5">
            <div v-for="g in goalsDisplay" :key="g.id">
              <div class="flex justify-between text-xs text-ink-700 mb-1">
                <span>{{ g.title }}</span>
                <span class="flex items-center gap-2">
                  {{ g.label }}
                  <span class="cursor-pointer text-danger flex" @click="deleteGoalMutation.mutate(g.id)"><Icon name="trash" :size="13" /></span>
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
    </template>

    <Modal v-if="retro.retroGoalModalOpen" title="新增目標追蹤" @close="retro.closeRetroGoalModal()">
      <label class="text-xs font-medium text-ink-700">目標名稱</label>
      <input
        v-model="retro.retroGoalForm.title"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="retro.retroGoalTouched && !retro.retroGoalForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">開始日期</label>
      <input
        v-model="retro.retroGoalForm.start"
        type="date"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="retro.retroGoalTouched && !retro.retroGoalForm.start ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">預計天數（選填，不填則視為持續進行）</label>
      <input
        v-model="retro.retroGoalForm.totalDays"
        type="number"
        min="1"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
      />
      <p v-if="retro.retroGoalTouched && (!retro.retroGoalForm.title.trim() || !retro.retroGoalForm.start)" class="text-danger text-xs mb-2.5">
        ⚠ 請填寫目標名稱與開始日期
      </p>
      <div class="flex gap-2.5 mt-2">
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer"
          @click="retro.closeRetroGoalModal()"
        >
          取消
        </button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer"
          @click="submitGoal"
        >
          儲存
        </button>
      </div>
    </Modal>
  </div>
</template>
