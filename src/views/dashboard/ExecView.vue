<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore } from '@/stores/core'
import { useExecStore } from '@/stores/exec'
import Icon from '@/components/common/Icon.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import Modal from '@/components/common/Modal.vue'
import { themeColor } from '@/lib/themeColor'

const core = useCoreStore()
const exec = useExecStore()

const hasExecData = computed(() => core.plans.length > 0 || exec.todayTasks.length > 0)

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
        <span class="text-xs font-medium bg-cream-100 text-clay-500 px-2.5 py-1 rounded-full">第 {{ exec.weekNumber }} 週</span>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="d in exec.weekDays"
          :key="d.date"
          class="flex flex-col items-center gap-4 rounded-2xl py-4.5 px-1.5 cursor-pointer"
          :class="d.isToday ? 'bg-brand-primary shadow-md' : 'bg-cream-100'"
        >
          <span class="text-xs" :class="d.isToday ? 'text-white font-medium' : 'text-ink-700'">{{ d.label }}</span>
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center"
            :class="d.isToday ? '' : d.done ? 'bg-success-bg-soft' : 'bg-cream-150'"
          >
            <Icon
              :name="d.done ? 'checkCircle' : 'goal'"
              :size="d.isToday ? 24 : 20"
              :class="d.isToday ? 'text-white' : d.done ? 'text-brand-primary' : 'text-sand-400'"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 bg-cream-90 rounded-card p-4">
        <div class="text-sm font-medium text-ink-800 mb-3">任務清單（今天）</div>
        <p v-if="exec.todayTasks.length === 0" class="m-0 text-xs text-sand-400">這天沒有排定的任務</p>
        <div v-else class="flex flex-col gap-2.5">
          <div
            v-for="t in exec.todayTasks"
            :key="t.id"
            class="flex items-center gap-2.5 text-sm cursor-pointer"
            :class="t.done ? 'text-sand-400' : 'text-ink-900'"
            @click="exec.toggleTask(t.id)"
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
      <div class="flex flex-col gap-2.5 mt-2.5">
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
    </div>

    <div class="flex flex-col gap-3.5 min-w-0">
      <div class="bg-gold-accent rounded-card px-5 py-7 text-center relative overflow-hidden shadow">
        <div class="flex items-center justify-center gap-2">
          <Icon name="fire" :size="24" class="text-ink-amber" />
          <span class="font-medium text-ink-amber whitespace-nowrap" style="font-size: 22px">連續 {{ core.streakDays }} 天</span>
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
            type="button"
            class="block w-full text-center mt-3 py-2.5 rounded-control bg-brand-primary text-white text-xs font-medium cursor-pointer"
          >
            ✓ 今日打卡
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
  </div>
</template>
