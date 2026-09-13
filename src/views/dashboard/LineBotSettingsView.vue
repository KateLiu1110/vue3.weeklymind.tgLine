<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore } from '@/stores/core'
import { useAuthStore } from '@/stores/auth'
import { updatePreferences } from '@/api/client/preferences'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import LockedFeature from '@/components/common/LockedFeature.vue'
import { themeColor } from '@/lib/themeColor'

const core = useCoreStore()
const auth = useAuthStore()

async function setBotLang(lang: string) {
  if (!auth.requireLogin()) return
  const updated = await updatePreferences({ botLang: lang })
  if (auth.user) auth.user.botLang = updated.botLang
}

// 推播模擬預覽用的示意筆數，跟「提醒事項」開放後的真實資料無關。
const previewReminderCount = 5

const platformStatusText = computed(() => (auth.user?.lineUserId ? '已綁定' : '未綁定'))

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
        </div>
        <p class="m-0 mb-3.5 text-xs text-sand-600">
          依時間由 LineBot 推播，使用者可直接在 LINE 內回覆完成
        </p>

        <LockedFeature title="提醒事項開發中" hint="這個功能還在打造，之後上線會在這裡通知你" />
      </div>

      <!-- 綁定通訊軟體 -->
      <div class="bg-cream-50 border border-cream-150 rounded-card p-5">
        <div class="text-sm font-medium text-ink-800 mb-3.5">綁定通訊軟體</div>
        <div class="flex gap-2.5 mb-3.5">
          <div class="flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-control border bg-success-bg-soft border-brand-primary">
            <span class="w-8 h-8 rounded-lg bg-line-brand flex items-center justify-center shrink-0 text-white text-sm">L</span>
            <span class="text-left">
              <div class="text-xs font-medium text-ink-900">LINE</div>
              <div class="text-[10.5px] text-brand-primary">{{ platformStatusText }}</div>
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between bg-cream-100 rounded-control px-3.5 py-2.5">
          <span class="text-xs text-ink-700">Bot 回覆語言</span>
          <div class="flex gap-1.5">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0"
              :class="auth.user?.botLang === 'zh' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'"
              @click="setBotLang('zh')"
            >
              繁體中文
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0"
              :class="auth.user?.botLang === 'en' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'"
              @click="setBotLang('en')"
            >
              English
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0"
              :class="auth.user?.botLang === 'ja' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'"
              @click="setBotLang('ja')"
            >
              日本語
            </button>
          </div>
        </div>
      </div>

      <!-- 推播時間設定 -->
      <div class="bg-cream-50 border border-cream-150 rounded-card p-5">
        <div class="text-sm font-medium text-ink-800 mb-3.5">推播時間設定</div>
        <LockedFeature title="推播時間設定開發中" hint="目前所有使用者共用同一組推播時間，之後開放個人化設定時會通知你" />
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
            <div class="text-xs font-medium text-white">早安！今天有 {{ previewReminderCount }} 項打卡 ☀️</div>
            <div class="text-xs leading-relaxed text-white/82 mt-0.5">
              背單字、閱讀測驗、深蹲訓練⋯點開回報今天的進度。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
