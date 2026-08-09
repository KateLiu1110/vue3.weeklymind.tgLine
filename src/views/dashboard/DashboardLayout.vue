<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useCoreStore, PLAN_TEMPLATE_CARDS } from '@/stores/core'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { fetchMe } from '@/api/client/auth'
import { usePlans } from '@/composables/usePlans'
import { useMilestones } from '@/composables/useMilestones'
import { useAchievements } from '@/composables/useAchievements'
import { ACHIEVEMENT_KEYS } from '@/api/client/achievements'
import Modal from '@/components/common/Modal.vue'
import Icon from '@/components/common/Icon.vue'

const core = useCoreStore()
const settings = useSettingsStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

function logout() {
  auth.logout()
  core.resetLocalState()
  router.push({ name: 'login' })
}

// Token 只存在 localStorage，重新整理頁面後 auth.user 是空的（沒有另外存 user 物件），
// 這裡補一次 /auth/me 讓畫面知道「這是誰」。
onMounted(() => {
  if (auth.isLoggedIn && !auth.user) {
    fetchMe()
      .then((user) => {
        auth.user = user
      })
      .catch(() => {
        // token 失效（過期/後端 JWT_SECRET 換了）就直接視為登出，回到訪客模式。
        auth.logout()
        core.resetLocalState()
      })
  }
})

// 計畫管理 module now reads/writes through the real API (see api-architecture.md);
// this is the single place that hydrates the Pinia core store from the server
// fetch so every consumer (Overview, ExecView, sidebar) keeps working unchanged.
// 訪客（未登入）沒有 token，usePlans/useMilestones 內建的 enabled 判斷不會發出請求，
// 畫面自然呈現空狀態，不需要另外的「示範空白帳號」開關。
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
const apiUnreachable = computed(
  () => auth.isLoggedIn && (plansQuery.isError.value || milestonesQuery.isError.value),
)

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
  { name: 'links', label: '連結收藏', icon: 'navLink', achievementKey: ACHIEVEMENT_KEYS.links },
  { name: 'retro', label: '覆盤中心', icon: 'chart', achievementKey: ACHIEVEMENT_KEYS.retro },
]
const achievementsQuery = useAchievements()
function isToolLocked(key: string): boolean {
  return auth.isLoggedIn && !(achievementsQuery.data.value ?? []).includes(key)
}
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

const weekdayShort = ['一', '二', '三', '四', '五', '六', '日']
</script>

<template>
  <div class="min-h-screen flex bg-cream-125 font-normal" style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif">
    <aside
      class="shrink-0 bg-cream-50 border-r border-cream-150 flex flex-col gap-1 p-3 transition-[width] duration-150"
      :class="sidebarCollapsed ? 'w-18' : 'w-56'"
    >
      <RouterLink
        :to="{ name: 'overview' }"
        class="flex items-center gap-2.5 px-1 pb-4.5 cursor-pointer"
        :class="sidebarCollapsed ? 'justify-center' : ''"
      >
        <img :src="settings.avatarSrc" class="w-8.5 h-8.5 rounded-[10px] object-cover shrink-0" />
        <div v-if="!sidebarCollapsed">
          <div class="font-medium text-ink-800 leading-tight whitespace-nowrap" style="font-size: 15px">WeeklyMind</div>
          <div class="text-xs text-sand-400 whitespace-nowrap">掌控你的每一週</div>
        </div>
      </RouterLink>

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
        class="group flex items-center gap-1.5 px-3 py-2.5 rounded-[11px] text-sm font-medium text-ink-700"
        :class="sidebarCollapsed ? 'justify-center' : ''"
        active-class="bg-brand-primary text-white"
      >
        <span class="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ mod.title }}</span>
        <span
          v-if="!sidebarCollapsed"
          class="shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer"
          title="刪除計畫"
          @click.stop.prevent="core.deletePlanAndModule(mod.id)"
        >
          <Icon name="trash" :size="13" />
        </span>
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
        <Icon :name="isToolLocked(item.achievementKey) ? 'lock' : item.icon" :size="16" />
        <span v-if="!sidebarCollapsed" class="flex-1 whitespace-nowrap" :class="isToolLocked(item.achievementKey) ? 'text-sand-400' : ''">
          {{ item.label }}
        </span>
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
          <div class="font-medium text-brand-primary leading-none whitespace-nowrap" style="font-size: 16px">{{ auth.isLoggedIn ? core.streakDays : 0 }} 天</div>
          <div class="text-xs text-sand-400 whitespace-nowrap">連續打卡</div>
        </div>
      </div>
      <div class="flex items-center gap-4 pt-2 px-2 text-xs text-sand-500" :class="sidebarCollapsed ? 'justify-center' : ''">
        <span class="flex items-center gap-1.5 cursor-pointer" @click="core.openHelpModal()">
          <Icon name="navHelp" :size="14" />
          <span v-if="!sidebarCollapsed" class="whitespace-nowrap">說明</span>
        </span>
        <span v-if="!sidebarCollapsed && auth.isLoggedIn" class="flex items-center gap-1.5 whitespace-nowrap cursor-pointer" @click="logout">
          <Icon name="navLogout" :size="14" />登出
        </span>
        <RouterLink
          v-else-if="!sidebarCollapsed"
          :to="{ name: 'login' }"
          class="flex items-center gap-1.5 whitespace-nowrap text-brand-primary font-medium"
        >
          <Icon name="navLogout" :size="14" />登入
        </RouterLink>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-auto">
      <div class="flex items-center justify-between mb-5.5">
        <h1 class="m-0 font-medium text-ink-800" style="font-size: 20px">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3.5">
          <RouterLink
            v-if="!auth.isLoggedIn"
            :to="{ name: 'login' }"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-primary text-brand-primary bg-success-bg-soft text-xs font-medium whitespace-nowrap"
          >
            <Icon name="inbox" :size="13" />
            訪客模式・點此登入
          </RouterLink>
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

    <!-- 側邊欄「新增計畫」隨時可以點，所以這個 Modal 要掛在 Layout 這層（不能只放在
    計劃管理頁面裡）——否則從其他頁面點擊只會先把 core.planModalOpen 設成 true，
    要等切到計劃管理頁、Modal 元件才真的被掛載出來，變成「按兩次才會出現」。 -->
    <Modal v-if="core.planModalOpen" title="新增計畫" :width="420" @close="core.closePlanModal()">
      <label class="text-xs font-medium text-ink-700">計畫名稱</label>
      <input
        v-model="core.planForm.title"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.planTouched && !core.planForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">副標</label>
      <input v-model="core.planForm.sub" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">計畫範本</label>
      <div class="flex flex-col gap-2 mt-1.5 mb-3.5">
        <div
          v-for="tpl in PLAN_TEMPLATE_CARDS"
          :key="tpl.kind"
          class="flex items-center gap-2.5 px-3.5 py-3 rounded-control cursor-pointer border-[1.5px]"
          :class="core.planForm.template === tpl.kind ? 'bg-success-bg-soft border-brand-primary' : 'bg-cream-75 border-cream-150'"
          @click="core.selectPlanTemplate(tpl.kind)"
        >
          <Icon :name="tpl.icon" :size="20" :class="core.planForm.template === tpl.kind ? 'text-brand-primary' : 'text-sand-400'" />
          <div class="flex-1">
            <div class="text-sm font-medium text-ink-900">{{ tpl.label }}</div>
            <div class="text-xs text-sand-500 mt-0.5">{{ tpl.desc }}</div>
          </div>
          <span
            class="w-4.5 h-4.5 rounded-full border-2 shrink-0"
            :class="core.planForm.template === tpl.kind ? 'border-brand-primary bg-brand-primary' : 'border-sand-275 bg-transparent'"
          />
        </div>
      </div>
      <label class="text-xs font-medium text-ink-700">執行星期（可複選）</label>
      <div class="flex gap-1.5 mt-1.5 mb-3.5">
        <span
          v-for="(w, i) in weekdayShort"
          :key="i"
          class="flex-1 text-center py-2 rounded-control text-xs font-medium cursor-pointer"
          :class="core.planForm.weekdays.includes(i) ? 'bg-brand-primary text-white' : 'bg-cream-100 text-ink-700'"
          @click="core.togglePlanWeekday(i)"
        >
          {{ w }}
        </span>
      </div>
      <div class="flex gap-3 mb-3.5">
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">開始時間</label>
          <input v-model="core.planForm.startTime" type="time" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">結束時間</label>
          <input v-model="core.planForm.endTime" type="time" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
      </div>
      <label class="text-xs font-medium text-ink-700">預計多久完成</label>
      <select v-model="core.planForm.months" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="1">1 個月</option>
        <option value="2">2 個月</option>
        <option value="3">3 個月</option>
        <option value="6">6 個月</option>
        <option value="12">12 個月</option>
      </select>
      <p class="m-0 mb-3.5 text-xs text-sand-400">完成度將依每日打卡自動計算，無須手動設定</p>
      <p v-if="core.planTouched && !core.planForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫計畫名稱</p>
      <p v-if="core.planError" class="text-danger text-xs mb-2.5">⚠ {{ core.planError }}</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closePlanModal()">取消</button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="core.planSaving"
          @click="core.savePlan()"
        >
          {{ core.planSaving ? '新增中…' : '新增' }}
        </button>
      </div>
    </Modal>

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

    <Modal v-if="auth.loginPromptOpen" title="請先登入" :width="360" @close="auth.closeLoginPrompt()">
      <div class="flex flex-col items-center text-center gap-3 py-2">
        <img src="/assets/mascot-dog-2.png" class="w-14 h-14 object-contain" />
        <p class="m-0 text-sm text-ink-700">訪客只能觀摩畫面，登入後才能新增或編輯資料</p>
        <RouterLink
          :to="{ name: 'login' }"
          class="block w-full text-center bg-brand-primary text-white font-medium py-2.5 rounded-control cursor-pointer"
          @click="auth.closeLoginPrompt()"
        >
          前往登入
        </RouterLink>
      </div>
    </Modal>
  </div>
</template>
