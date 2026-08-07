<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useCoreStore } from '@/stores/core'
import { useSettingsStore } from '@/stores/settings'
import { usePlans } from '@/composables/usePlans'
import { useMilestones } from '@/composables/useMilestones'
import Modal from '@/components/common/Modal.vue'
import Icon from '@/components/common/Icon.vue'

const core = useCoreStore()
const settings = useSettingsStore()
const route = useRoute()

// 計畫管理 module now reads/writes through the real API (see api-architecture.md);
// this is the single place that hydrates the Pinia core store from the server
// fetch so every consumer (Overview, ExecView, sidebar) keeps working unchanged.
const plansQuery = usePlans()
const milestonesQuery = useMilestones()
watch(
  () => plansQuery.data.value,
  (plans) => {
    if (plans) core.hydratePlans(plans)
  },
  { immediate: true },
)
watch(
  () => milestonesQuery.data.value,
  (milestones) => {
    if (milestones) core.hydrateMilestones(milestones)
  },
  { immediate: true },
)
const apiUnreachable = computed(() => plansQuery.isError.value || milestonesQuery.isError.value)

const navItems = [
  { name: 'overview', label: '計劃管理', icon: 'navGrid' },
  { name: 'exec', label: '執行中心', icon: 'navBolt' },
]
const goalNavItems = [
  { name: 'toeic', label: '多益英文', icon: 'navBook' },
  { name: 'portfolio', label: '作品集看板', icon: 'navFolder' },
  { name: 'sport', label: '運動', icon: 'navPerson' },
]
const toolNavItems = [
  { name: 'links', label: '連結收藏', icon: 'navLink' },
  { name: 'retro', label: '覆盤中心', icon: 'chart' },
]
const systemNavItems = [
  { name: 'settings', label: '設定', icon: 'gear' },
  { name: 'linebot', label: 'LineBot 設定', icon: 'navChat' },
]

const PAGE_TITLES: Record<string, string> = {
  overview: '計劃管理',
  exec: '執行中心',
  toeic: '多益英文',
  portfolio: '作品集看板',
  sport: '運動',
  links: '連結收藏',
  retro: '覆盤中心',
  settings: '設定',
  linebot: 'LineBot 設定',
  custom: '自訂模組',
}
const pageTitle = computed(() => PAGE_TITLES[route.name as string] ?? 'WeeklyMind')

const sidebarCollapsed = ref(false)
const notifOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex bg-cream-125 font-normal" style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif">
    <aside
      class="shrink-0 bg-cream-50 border-r border-cream-150 flex flex-col gap-1 p-3 transition-[width] duration-150"
      :class="sidebarCollapsed ? 'w-18' : 'w-56'"
    >
      <div class="flex items-center gap-2.5 px-1 pb-4.5" :class="sidebarCollapsed ? 'justify-center' : ''">
        <img :src="settings.avatarSrc" class="w-8.5 h-8.5 rounded-[10px] object-cover shrink-0" />
        <div v-if="!sidebarCollapsed">
          <div class="font-medium text-ink-800 leading-tight whitespace-nowrap" style="font-size: 15px">WeeklyMind</div>
          <div class="text-xs text-sand-400 whitespace-nowrap">掌控你的每一週</div>
        </div>
      </div>

      <span
        class="flex items-center gap-2 px-2 py-1.5 mb-1.5 text-sand-600 cursor-pointer text-xs font-medium"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <Icon name="chevronsLeft" :size="14" :class="sidebarCollapsed ? 'rotate-180' : ''" />
        <span v-if="!sidebarCollapsed" class="whitespace-nowrap">收合選單</span>
      </span>

      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-ink-700"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        active-class="bg-brand-primary text-white"
      >
        <Icon :name="item.icon" :size="16" />
        <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>

      <div v-if="!sidebarCollapsed" class="text-xs font-medium text-sand-300 tracking-wide px-2.5 pt-3 pb-0.5">目標計畫</div>
      <RouterLink
        v-for="item in goalNavItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-ink-700"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        active-class="bg-brand-primary text-white"
      >
        <Icon :name="item.icon" :size="16" />
        <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>
      <RouterLink
        v-for="mod in core.customModules"
        :key="mod.id"
        :to="{ name: 'custom', params: { id: mod.id } }"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-ink-700 overflow-hidden text-ellipsis whitespace-nowrap"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        active-class="bg-brand-primary text-white"
      >
        {{ mod.title }}
      </RouterLink>
      <button
        type="button"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-brand-primary cursor-pointer"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        @click="core.openPlanModal()"
      >
        <span class="text-base leading-none">＋</span>
        <span v-if="!sidebarCollapsed" class="whitespace-nowrap">新增計畫</span>
      </button>

      <div v-if="!sidebarCollapsed" class="text-xs font-medium text-sand-300 tracking-wide px-2.5 pt-3 pb-0.5">工具</div>
      <RouterLink
        v-for="item in toolNavItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-ink-700"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        active-class="bg-brand-primary text-white"
      >
        <Icon :name="item.icon" :size="16" />
        <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>

      <div v-if="!sidebarCollapsed" class="text-xs font-medium text-sand-300 tracking-wide px-2.5 pt-3 pb-0.5">系統</div>
      <RouterLink
        v-for="item in systemNavItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-ink-700"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        active-class="bg-brand-primary text-white"
      >
        <Icon :name="item.icon" :size="16" />
        <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>

      <div
        class="mt-auto bg-cream-100 rounded-card p-3.5 flex items-center gap-2.5"
        :class="sidebarCollapsed ? 'justify-center' : ''"
      >
        <Icon name="fire" :size="20" class="text-brand-primary shrink-0" />
        <div v-if="!sidebarCollapsed">
          <div class="font-medium text-brand-primary leading-none whitespace-nowrap" style="font-size: 16px">{{ core.streakDays }} 天</div>
          <div class="text-xs text-sand-400 whitespace-nowrap">連續打卡</div>
        </div>
      </div>
      <div class="flex items-center gap-4 pt-2 px-2 text-xs text-sand-500" :class="sidebarCollapsed ? 'justify-center' : ''">
        <span class="flex items-center gap-1.5 cursor-pointer" @click="core.openHelpModal()">
          <Icon name="navHelp" :size="14" />
          <span v-if="!sidebarCollapsed" class="whitespace-nowrap">說明</span>
        </span>
        <RouterLink v-if="!sidebarCollapsed" :to="{ name: 'login' }" class="flex items-center gap-1.5 whitespace-nowrap">
          <Icon name="navLogout" :size="14" />登出
        </RouterLink>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-auto">
      <div class="flex items-center justify-between mb-5.5">
        <h1 class="m-0 font-medium text-ink-800" style="font-size: 20px">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3.5">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer whitespace-nowrap"
            :class="core.demoEmpty ? 'border-brand-primary text-brand-primary bg-success-bg-soft' : 'border-sand-200 text-sand-500 bg-transparent'"
            @click="core.toggleDemoEmpty()"
          >
            <Icon name="inbox" :size="13" />
            {{ core.demoEmpty ? '新帳號（空白）' : '預覽新帳號空白狀態' }}
          </button>
          <div class="relative">
            <span class="text-sand-500 cursor-pointer flex" @click="notifOpen = !notifOpen">
              <Icon name="bell" :size="18" />
            </span>
            <div
              v-if="notifOpen"
              class="absolute top-7 right-0 w-65 bg-cream-50 border border-cream-150 rounded-card shadow-lg p-3.5 z-40"
            >
              <div class="text-xs font-medium text-ink-800 mb-2">今日尚未打卡的目標</div>
              <p class="m-0 text-xs text-sand-400">今天的目標都打卡完成了 🎉</p>
            </div>
          </div>
          <img :src="settings.avatarSrc" class="w-9 h-9 rounded-full object-cover border border-cream-150" />
        </div>
      </div>
      <div
        v-if="apiUnreachable"
        class="flex items-center gap-2.5 mb-4 px-4 py-3 rounded-control bg-amber-bg-soft border border-amber-solid text-amber-dark text-xs font-medium"
      >
        <Icon name="bell" :size="14" class="shrink-0" />
        無法連接後端伺服器，計畫／里程碑資料暫時無法載入。請在 server/ 目錄執行「npm run dev」（或於根目錄執行「npm run dev:full」同時啟動前後端）。
      </div>
      <RouterView />
    </main>

    <Modal v-if="core.helpModalOpen" title="WeeklyMind 操作流程" :width="720" @close="core.closeHelpModal()">
      <p class="m-0 mb-4 text-xs text-sand-600">快速了解如何使用 WeeklyMind 提升效率</p>
      <div class="flex flex-col gap-4">
        <div class="rounded-card p-4.5 bg-success-bg-soft">
          <div class="flex items-center gap-2.5 mb-3.5">
            <span class="w-9 h-9 rounded-xl bg-cream-50 flex items-center justify-center text-brand-primary shrink-0"><Icon name="goal" :size="18" /></span>
            <div>
              <div class="text-sm font-medium text-ink-900">目標管理</div>
              <div class="text-xs text-sand-600">從零開始規劃你的成長里程碑</div>
            </div>
          </div>
          <div class="flex items-stretch gap-2 flex-wrap">
            <div class="flex-1 min-w-[130px] bg-cream-50 rounded-control p-3">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">1</span>
                <span class="text-xs font-medium text-ink-900">新增計畫</span>
              </div>
              <p class="m-0 text-xs leading-relaxed text-sand-600">在「計畫中心」定義核心目標與階段性里程碑</p>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[130px] bg-cream-50 rounded-control p-3">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">2</span>
                <span class="text-xs font-medium text-ink-900">設定時間</span>
              </div>
              <p class="m-0 text-xs leading-relaxed text-sand-600">分配執行星期與時段，讓進度可量化</p>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[130px] bg-cream-50 rounded-control p-3">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">3</span>
                <span class="text-xs font-medium text-ink-900">執行匯整</span>
              </div>
              <p class="m-0 text-xs leading-relaxed text-sand-600">「執行中心」自動彙整每日進度與配速</p>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[130px] bg-brand-primary/10 rounded-control p-3">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-6.5 h-6.5 rounded-full bg-brand-primary text-white font-medium text-xs flex items-center justify-center shrink-0">4</span>
                <span class="text-xs font-medium text-brand-primary">達成成就</span>
              </div>
              <p class="m-0 text-xs leading-relaxed text-ink-700">打卡到 100% 後自動生成里程碑卡片</p>
            </div>
          </div>
        </div>

        <div class="rounded-card p-4.5 bg-line-brand-bg">
          <div class="flex items-center gap-2.5 mb-3.5">
            <span class="w-9 h-9 rounded-xl bg-line-brand flex items-center justify-center shrink-0">
              <span class="w-4.5 h-3.5 bg-white rounded" style="border-radius: 6px 6px 6px 2px" />
            </span>
            <div>
              <div class="text-sm font-medium text-ink-900">LineBot 同步</div>
              <div class="text-xs text-sand-600">連結收藏與每日行程，都透過 LINE 完成</div>
            </div>
          </div>
          <div class="text-xs font-medium text-clay-500 mb-2">連結收藏</div>
          <div class="flex items-center gap-2 flex-wrap mb-4">
            <div class="flex-1 min-w-[120px] bg-cream-50 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-cream-175 text-clay-500 font-medium text-xs flex items-center justify-center shrink-0">1</span>
              <span class="text-xs font-medium text-ink-900">在 LINE 貼上連結</span>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[160px] bg-cream-175 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-clay-500 text-white font-medium text-xs flex items-center justify-center shrink-0">2</span>
              <span class="text-xs font-medium text-clay-500">自動分類 IG／Threads／FB</span>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[130px] bg-cream-50 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-cream-175 text-clay-500 font-medium text-xs flex items-center justify-center shrink-0">3</span>
              <span class="text-xs font-medium text-ink-900">於「連結收藏」查看</span>
            </div>
          </div>
          <div class="text-xs font-medium text-line-brand-dark mb-2">每日目標與行程</div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex-1 min-w-[150px] bg-cream-50 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">1</span>
              <span class="text-xs font-medium text-ink-900">每日目標與行程排定</span>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[150px] bg-line-brand-bg rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-line-brand text-white font-medium text-xs flex items-center justify-center shrink-0">2</span>
              <span class="text-xs font-medium text-line-brand-dark">LineBot 推播提醒</span>
            </div>
          </div>
        </div>

        <div class="rounded-card p-4.5 bg-cream-100">
          <div class="flex items-center gap-2.5 mb-3.5">
            <span class="w-9 h-9 rounded-xl bg-cream-150 flex items-center justify-center text-sand-600 shrink-0"><Icon name="gear" :size="18" /></span>
            <div class="text-sm font-medium text-ink-900">設定流程</div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex-1 min-w-[150px] bg-cream-50 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">1</span>
              <span class="text-xs font-medium text-ink-900">個人帳號設定</span>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[150px] bg-success-bg-soft rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-brand-primary text-white font-medium text-xs flex items-center justify-center shrink-0">2</span>
              <span class="text-xs font-medium text-brand-primary">新增頭像</span>
            </div>
          </div>
        </div>

        <div class="rounded-card p-4.5 bg-line-brand-bg">
          <div class="flex items-center gap-2.5 mb-3.5">
            <span class="w-9 h-9 rounded-xl bg-line-brand-bg flex items-center justify-center text-line-brand shrink-0"><Icon name="chat" :size="18" /></span>
            <div class="text-sm font-medium text-ink-900">LineBot 設定流程</div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex-1 min-w-[130px] bg-cream-50 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">1</span>
              <span class="text-xs font-medium text-ink-900">新增提醒事項</span>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[130px] bg-cream-50 rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-cream-100 text-brand-primary font-medium text-xs flex items-center justify-center shrink-0">2</span>
              <span class="text-xs font-medium text-ink-900">設定推播時間</span>
            </div>
            <div class="flex items-center justify-center text-sand-400">→</div>
            <div class="flex-1 min-w-[150px] bg-line-brand-bg rounded-control p-2.5 flex items-center gap-2.5">
              <span class="w-6.5 h-6.5 rounded-full bg-line-brand text-white font-medium text-xs flex items-center justify-center shrink-0">3</span>
              <span class="text-xs font-medium text-line-brand-dark">接收每日/週覆盤推播</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-5">
        <button type="button" class="bg-brand-primary text-white text-sm font-medium px-6 py-2.5 rounded-full cursor-pointer" @click="core.closeHelpModal()">
          我知道了
        </button>
      </div>
    </Modal>
  </div>
</template>
