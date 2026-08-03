<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore } from '@/stores/core'
import Icon from '@/components/common/Icon.vue'
import InlineEditText from '@/components/common/InlineEditText.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import { themeColor } from '@/lib/themeColor'

const props = defineProps<{ moduleId: string }>()
const core = useCoreStore()
const mod = computed(() => core.customModules.find((m) => m.id === props.moduleId)!)

const ringOffset = computed(() => {
  const current = Number(mod.value.heroCurrent) || 0
  const target = Number(mod.value.heroTarget) || 0
  if (!target) return 264
  const pct = Math.min(current / target, 1)
  return 264 - 264 * pct
})

const newTaskTitle = reactive({ value: '' })
function addDailyTask() {
  const title = newTaskTitle.value.trim()
  if (!title) return
  mod.value.dailyTasks.push({ id: 'dt' + Date.now(), title, done: false })
  newTaskTitle.value = ''
}
function toggleTask(id: string) {
  const t = mod.value.dailyTasks.find((x) => x.id === id)
  if (t) t.done = !t.done
}
function deleteTask(id: string) {
  mod.value.dailyTasks = mod.value.dailyTasks.filter((t) => t.id !== id)
}

const newScore = reactive({ label: '', value: '' })
const scoreChartData = computed<ChartData<'bar'>>(() => ({
  labels: mod.value.scores.map((s) => s.label),
  datasets: [
    {
      data: mod.value.scores.map((s) => s.value),
      backgroundColor: themeColor('clay-400'),
      borderRadius: 4,
      maxBarThickness: 40,
    },
  ],
}))
const scoreChartOptions: ChartOptions<'bar'> = {
  scales: {
    x: { display: false },
    y: { display: false },
  },
  plugins: { legend: { display: false } },
}
function addScore() {
  if (!newScore.label || !newScore.value) return
  mod.value.scores.push({ id: 'sc' + Date.now(), label: newScore.label, value: Number(newScore.value) || 0 })
  newScore.label = ''
  newScore.value = ''
}
function deleteScore(id: string) {
  mod.value.scores = mod.value.scores.filter((s) => s.id !== id)
}

const newExam = reactive({ title: '', date: '' })
function addExamDate() {
  if (!newExam.title || !newExam.date) return
  mod.value.examDates.push({ id: 'ed' + Date.now(), title: newExam.title, date: newExam.date })
  newExam.title = ''
  newExam.date = ''
}
function deleteExamDate(id: string) {
  mod.value.examDates = mod.value.examDates.filter((e) => e.id !== id)
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
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <InlineEditText
              v-model="mod.heroCurrent"
              placeholder="0"
              display-class="font-medium text-ink-800 text-lg"
              input-class="w-14 text-center font-medium text-ink-800 text-lg"
            />
            <InlineEditText
              v-model="mod.heroTarget"
              placeholder="目標"
              display-class="text-xs text-sand-500"
              input-class="w-16 text-center text-xs text-sand-500"
            />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <InlineEditText
            v-model="mod.heroTitle"
            placeholder="新增標題，如：多益目標 600 分"
            display-class="text-base font-medium text-ink-900 block"
            input-class="w-full text-base font-medium text-ink-900"
          />
          <InlineEditText
            v-model="mod.heroDesc"
            placeholder="新增描述，如：每日車上 1 小時，背單字、閱讀測驗"
            display-class="text-xs text-sand-600 block mt-1.5"
            input-class="w-full text-xs text-sand-600 mt-1.5"
          />
          <InlineEditText
            v-model="mod.heroSchedule"
            placeholder="新增固定行程，如：每週三 19:00 英文課"
            display-class="inline-flex items-center gap-1.5 mt-2 bg-cream-100 text-clay-500 text-xs font-medium px-2.5 py-1 rounded-full"
            input-class="mt-2 text-xs"
          />
        </div>
      </div>

      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-ink-800">每日任務</span>
        <div class="flex items-center gap-1.5">
          <input
            v-model="newTaskTitle.value"
            placeholder="任務名稱"
            class="text-xs px-2.5 py-1.5 rounded-control border border-sand-200 outline-none w-32"
            @keyup.enter="addDailyTask"
          />
          <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="addDailyTask">＋ 新增任務</span>
        </div>
      </div>
      <div v-if="mod.dailyTasks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <div v-for="dt in mod.dailyTasks" :key="dt.id" class="rounded-card p-4 bg-cream-50 border border-cream-150">
          <div class="flex items-center justify-between gap-1.5">
            <span class="flex items-center gap-2 min-w-0 overflow-hidden cursor-pointer" @click="toggleTask(dt.id)">
              <Icon name="checkCircle" :size="15" :class="dt.done ? 'text-brand-primary' : 'text-sand-300'" />
              <span class="text-sm font-medium text-ink-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ dt.title }}</span>
            </span>
            <span class="cursor-pointer text-danger shrink-0 flex" @click="deleteTask(dt.id)"><Icon name="trash" :size="13" /></span>
          </div>
          <div class="h-1.5 rounded-full bg-cream-150 mt-2">
            <div class="h-full rounded-full" :class="dt.done ? 'bg-brand-primary' : 'bg-cream-150'" :style="{ width: dt.done ? '100%' : '0%' }" />
          </div>
          <div class="text-xs font-medium mt-2" :class="dt.done ? 'text-brand-primary' : 'text-sand-400'">
            {{ dt.done ? '已完成' : '待完成' }}
          </div>
        </div>
        <div class="rounded-card p-4 flex items-center justify-center gap-2 bg-cream-100">
          <Icon name="fire" :size="22" class="text-brand-primary" />
          <div>
            <div class="font-medium text-brand-primary" style="font-size: 17px">
              {{ mod.dailyTasks.filter((t) => t.done).length }} 天
            </div>
            <div class="text-xs text-sand-500">連續打卡</div>
          </div>
        </div>
      </div>
      <div v-else class="rounded-card text-center py-5 px-1 mb-3.5 bg-cream-50 border border-cream-150">
        <p class="m-0 text-xs font-medium text-sand-600">尚無每日任務</p>
        <p class="mt-1 mb-0 text-xs text-sand-400">輸入任務名稱並點擊「＋ 新增任務」建立第一個每日任務</p>
      </div>

      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-sm font-medium text-ink-800">分數趨勢</span>
          <div class="flex items-center gap-1.5">
            <input v-model="newScore.label" placeholder="標籤" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none w-16" />
            <input v-model="newScore.value" placeholder="分數" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none w-14" />
            <span class="text-xs text-brand-primary font-medium cursor-pointer whitespace-nowrap" @click="addScore">＋ 新增分數</span>
          </div>
        </div>
        <div v-if="mod.scores.length > 0">
          <ChartCanvas type="bar" :data="scoreChartData" :options="scoreChartOptions" :height="120" />
          <div class="flex gap-2.5 mt-1.5">
            <div v-for="sc in mod.scores" :key="sc.id" class="flex-1 flex items-center justify-center gap-1">
              <span class="text-xs text-sand-500 underline decoration-dotted">{{ sc.label }}</span>
              <span class="cursor-pointer text-danger flex" @click="deleteScore(sc.id)"><Icon name="trash" :size="11" /></span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 px-1">
          <p class="m-0 text-xs font-medium text-sand-600">尚無分數紀錄</p>
          <p class="mt-1 mb-0 text-xs text-sand-400">輸入標籤與分數並點擊「＋ 新增分數」記錄第一筆成績</p>
        </div>
      </div>
    </div>

    <div class="w-full xl:w-60 shrink-0">
      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3">
          <InlineEditText
            v-model="mod.examTitle"
            placeholder="新增標題"
            display-class="flex items-center gap-1.5 text-sm font-medium text-ink-800"
            input-class="text-sm font-medium text-ink-800 w-24"
          />
        </div>
        <div class="flex gap-1.5 mb-3">
          <input v-model="newExam.title" placeholder="標題" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none flex-1 min-w-0" />
          <input v-model="newExam.date" type="date" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none w-28" />
        </div>
        <span class="text-xs text-brand-primary font-medium cursor-pointer block mb-3" @click="addExamDate">＋ 新增</span>
        <p v-if="mod.examDates.length === 0" class="m-0 text-xs text-sand-400">尚未新增考試日期</p>
        <div v-else class="flex flex-col gap-3">
          <div v-for="ed in mod.examDates" :key="ed.id" class="bg-cream-100 rounded-card p-3 relative">
            <span class="absolute top-2.5 right-2.5 cursor-pointer text-danger flex" @click="deleteExamDate(ed.id)">
              <Icon name="trash" :size="13" />
            </span>
            <div class="text-xs font-medium text-ink-900 pr-4">{{ ed.title }}</div>
            <div class="text-xs text-sand-500 mt-0.5">{{ ed.date }}</div>
          </div>
        </div>
      </div>
      <div class="rounded-card p-4.5 mt-3.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3">
          <InlineEditText
            v-model="mod.scoreTitle"
            placeholder="新增標題"
            display-class="text-sm font-medium text-ink-800"
            input-class="text-sm font-medium text-ink-800 w-24"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5">
            <input v-model="mod.lastLabel" placeholder="標籤，如：上次" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none flex-1 min-w-0" />
            <input v-model="mod.lastScore" placeholder="數值" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none w-16" />
          </div>
          <div class="flex items-center gap-1.5">
            <input v-model="mod.targetLabel" placeholder="標籤，如：目標" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none flex-1 min-w-0" />
            <input v-model="mod.targetScore" placeholder="數值" class="text-xs px-2 py-1.5 rounded-control border border-sand-200 outline-none w-16" />
          </div>
        </div>
        <p v-if="!mod.targetScore" class="mt-2.5 mb-0 text-xs text-sand-400 leading-relaxed">
          尚未設定，可用於任何前後對比數值（如：自媒體觀看人數、1 個月前 / 1 個月後）
        </p>
      </div>
    </div>
  </div>
</template>
