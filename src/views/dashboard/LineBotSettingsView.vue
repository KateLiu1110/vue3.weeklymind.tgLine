<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore } from '@/stores/core'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import { themeColor } from '@/lib/themeColor'

const core = useCoreStore()

interface Reminder {
  id: string
  text: string
  time: string
}

const reminders = ref<Reminder[]>(
  core.demoEmpty
    ? []
    : [
        { id: 'li1', text: '補買雞胸肉、地瓜、燕麥', time: '07:30' },
        { id: 'li2', text: '背 20 個多益單字', time: '07:30' },
        { id: 'li3', text: '深蹲 4x8 · 引體向上 3x6', time: '18:00' },
        { id: 'li4', text: '《原子習慣》閱讀 30 頁', time: '21:00' },
        { id: 'li5', text: '學一個 Vue 3 概念', time: '21:00' },
      ],
)

function deleteReminder(id: string) {
  reminders.value = reminders.value.filter((r) => r.id !== id)
}

const weeklyDays = ['一', '二', '三', '四', '五', '六', '日']

const platformStatusText = computed(() =>
  core.botPlatform === 'line' ? '已綁定' : '未綁定',
)
const telegramStatusText = computed(() =>
  core.botPlatform === 'telegram' ? '已綁定' : '未綁定',
)

const weeklyReviewBars = [
  { label: '一', h: 32, active: false },
  { label: '二', h: 48, active: true },
  { label: '三', h: 44, active: true },
  { label: '四', h: 56, active: true },
  { label: '五', h: 60, active: true },
  { label: '六', h: 20, active: false },
  { label: '日', h: 14, active: false },
]
const weeklyReviewData = computed<ChartData<'bar'>>(() => ({
  labels: weeklyReviewBars.map((b) => b.label),
  datasets: [
    {
      data: weeklyReviewBars.map((b) => b.h),
      backgroundColor: weeklyReviewBars.map((b) => themeColor(b.active ? 'brand-primary' : 'sand-250')),
      borderRadius: 4,
      maxBarThickness: 22,
    },
  ],
}))
const weeklyReviewOptions: ChartOptions<'bar'> = {
  scales: {
    x: { grid: { display: false }, ticks: { color: themeColor('sand-500'), font: { size: 10 } } },
    y: { display: false },
  },
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-start">
    <div class="flex flex-col gap-4">
      <!-- 提醒事項 -->
      <div class="bg-cream-50 border border-cream-150 rounded-card p-5">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-ink-800">提醒事項</span>
          <button
            type="button"
            class="bg-brand-primary text-white text-xs font-medium px-3.5 py-1.5 rounded-full cursor-pointer"
          >
            + 新增提醒
          </button>
        </div>
        <p class="m-0 mb-3.5 text-xs text-sand-600">
          依時間由 LineBot 推播，使用者可直接在 LINE 內回覆完成
        </p>

        <div v-if="reminders.length === 0" class="text-center py-4 text-sand-400">
          <p class="m-0 mt-2 text-xs font-medium text-sand-600">新帳號尚未設定任何提醒事項</p>
          <p class="m-0 mt-0.5 text-xs text-sand-400">點擊上方「＋ 新增提醒」建立第一筆推播</p>
        </div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="it in reminders"
            :key="it.id"
            class="flex items-center gap-2.5 py-2 border-b border-cream-160"
          >
            <span class="flex-1 flex items-center gap-2 text-sm text-ink-900">{{ it.text }}</span>
            <span class="text-xs text-sand-500 shrink-0">{{ it.time }}</span>
            <button
              type="button"
              class="cursor-pointer text-danger shrink-0 bg-transparent border-0 p-0"
              @click="deleteReminder(it.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- 綁定通訊軟體 -->
      <div class="bg-cream-50 border border-cream-150 rounded-card p-5">
        <div class="text-sm font-medium text-ink-800 mb-3.5">綁定通訊軟體</div>
        <div class="flex gap-2.5 mb-3.5">
          <button
            type="button"
            class="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-control cursor-pointer border"
            :class="core.botPlatform === 'line' ? 'bg-success-bg-soft border-brand-primary' : 'bg-transparent border-cream-150'"
            @click="core.setBotPlatform('line')"
          >
            <span class="w-8 h-8 rounded-lg bg-line-brand flex items-center justify-center shrink-0 text-white text-sm">L</span>
            <span class="text-left">
              <div class="text-xs font-medium text-ink-900">LINE</div>
              <div class="text-[10.5px]" :class="core.botPlatform === 'line' ? 'text-brand-primary' : 'text-sand-500'">{{ platformStatusText }}</div>
            </span>
          </button>
          <button
            type="button"
            class="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-control cursor-pointer border"
            :class="core.botPlatform === 'telegram' ? 'bg-blue-bg-soft border-telegram-brand' : 'bg-transparent border-cream-150'"
            @click="core.setBotPlatform('telegram')"
          >
            <span class="w-8 h-8 rounded-lg bg-telegram-brand flex items-center justify-center shrink-0 text-white text-sm">T</span>
            <span class="text-left">
              <div class="text-xs font-medium text-ink-900">Telegram</div>
              <div class="text-[10.5px]" :class="core.botPlatform === 'telegram' ? 'text-telegram-brand' : 'text-sand-500'">{{ telegramStatusText }}</div>
            </span>
          </button>
        </div>
        <div class="flex items-center justify-between bg-cream-100 rounded-control px-3.5 py-2.5">
          <span class="text-xs text-ink-700">Bot 回覆語言</span>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0"
              :class="core.botLang === 'zh' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'"
              @click="core.setBotLang('zh')"
            >
              繁體中文
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0"
              :class="core.botLang === 'en' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'"
              @click="core.setBotLang('en')"
            >
              English
            </button>
          </div>
        </div>
      </div>

      <!-- 推播時間設定 -->
      <div class="bg-cream-50 border border-cream-150 rounded-card p-5">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm text-ink-900 font-medium">☀️ 每日早晨提醒</div>
              <div class="text-xs text-sand-500">推播今日打卡事項</div>
            </div>
            <input v-model="core.morningTime" type="time" class="px-2.5 py-1.5 rounded-control border border-sand-200 text-sm text-ink-900" />
          </div>
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm text-ink-900 font-medium">🌙 每日晚間總結</div>
              <div class="text-xs text-sand-500">回報完成 / 未完成事項</div>
            </div>
            <input v-model="core.eveningTime" type="time" class="px-2.5 py-1.5 rounded-control border border-sand-200 text-sm text-ink-900" />
          </div>
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm text-ink-900 font-medium">📊 每週覆盤報告</div>
              <div class="text-xs text-sand-500">本週完成率趨勢分析</div>
            </div>
            <div class="flex gap-1.5">
              <select v-model="core.weeklyReportDay" class="px-2 py-1.5 rounded-control border border-sand-200 text-xs text-ink-900">
                <option v-for="d in weeklyDays" :key="d" :value="d">週{{ d }}</option>
              </select>
              <input v-model="core.weeklyReportTime" type="time" class="px-2.5 py-1.5 rounded-control border border-sand-200 text-sm text-ink-900" />
            </div>
          </div>
        </div>
        <div class="mt-4 bg-cream-100 rounded-control px-3.5 py-3 flex items-center justify-between">
          <span class="text-xs text-ink-700">推播頻道</span>
          <span class="flex items-center gap-1.5 text-xs font-medium" :class="core.botPlatform === 'line' ? 'text-line-brand' : 'text-telegram-brand'">
            <span class="w-1.5 h-1.5 rounded-full inline-block" :class="core.botPlatform === 'line' ? 'bg-line-brand' : 'bg-telegram-brand'" />
            {{ core.botPlatform === 'line' ? 'LINE 推播中' : 'Telegram 推播中' }}
          </span>
        </div>
      </div>

      <!-- 每週覆盤中心 -->
      <div class="bg-cream-50 border border-cream-150 rounded-card p-5">
        <div class="text-sm font-medium text-ink-800 mb-3">每週覆盤中心</div>
        <ChartCanvas type="bar" :data="weeklyReviewData" :options="weeklyReviewOptions" :height="110" />
      </div>
    </div>

    <!-- 推播模擬預覽 -->
    <div class="flex flex-col items-center gap-3 sticky top-0">
      <span class="text-xs text-sand-500 font-medium">推播模擬預覽</span>
      <div class="w-[230px] h-[460px] rounded-card bg-ink-950-alt p-2.5">
        <div
          class="w-full h-full rounded-card relative overflow-hidden pt-8.5 px-3"
          style="
            background: linear-gradient(
              165deg,
              var(--color-teal-dark) 0%,
              var(--color-teal-darker) 45%,
              var(--color-slate-dark) 100%
            );
          "
        >
          <div class="text-center text-white">
            <div class="text-xs opacity-85">7月11日 星期六</div>
            <div class="font-medium mt-0.5" style="font-size: 34px">{{ core.morningTime }}</div>
          </div>
          <div class="mt-4.5 bg-white/16 rounded-card p-2.5 border border-white/18">
            <div class="flex items-center gap-1.5 mb-1.5">
              <div class="w-5 h-5 rounded-md bg-line-brand flex items-center justify-center shrink-0">
                <div class="w-2.5 h-2 bg-white rounded" style="border-radius: 4px 4px 4px 1px" />
              </div>
              <span class="text-xs font-medium text-white/95">LINE</span>
              <span class="ml-auto text-xs text-white/55">現在</span>
            </div>
            <div class="text-xs font-medium text-white">早安！今天有 {{ reminders.length }} 項打卡 ☀️</div>
            <div class="text-xs leading-relaxed text-white/82 mt-0.5">
              背單字、閱讀測驗、深蹲訓練⋯點開回報今天的進度。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
