<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCustomModules } from '@/composables/useCustomModules'
import { updateCustomModuleWithRetry } from '@/api/client/customModules'
import type { CustomModule } from '@/stores/core'

// 這頁原本是純示意圖（畫面上的按鈕沒有接任何邏輯），現在改成真的讀取「新增計畫」
// 建立的目標／看板／Tab 模組，並讓打卡按鈕真的能寫回後端——邏輯對齊
// server/src/routes/lineWebhook.ts 的 custom_task／custom_tab_item／custom_board_item／
// all_done postback，讓這頁看到的內容跟畫面右邊真正的 LINE Bot 打卡結果一致。
//
// 這頁是獨立路由（不掛在 DashboardLayout 底下），沒有 DashboardLayout 的自動存檔
// watch 可以借用，所以直接呼叫 updateCustomModuleWithRetry（跟 DashboardLayout.vue
// 共用同一支，含重試邏輯）。
const auth = useAuthStore()
const modulesQuery = useCustomModules()
const modules = ref<CustomModule[]>([])

watch(
  () => modulesQuery.data.value,
  (data) => {
    if (data && modules.value.length === 0) modules.value = JSON.parse(JSON.stringify(data))
  },
  { immediate: true },
)

interface DisplayTask {
  key: string
  moduleId: string
  itemId: string
  label: string
  done: boolean
  dotClass: string
  subtitle: string
}

const KIND_DOT_CLASS: Record<CustomModule['kind'], string> = {
  tab: 'bg-amber-solid',
  goal: 'bg-link-blue',
  board: 'bg-success-solid',
}

// 待辦清單：目標／Tab 模組的項目一律列出（完成與否用打勾樣式呈現，可以再點一次取消）；
// 看板模組只列「待辦」欄的卡片——看板卡片沒有 done 欄位，打勾＝移到「已完成」欄
// （跟 checkinCustomBoardItem 是同一件事），移過去之後就不會再出現在這份清單裡。
const todayTasks = computed<DisplayTask[]>(() => {
  const tasks: DisplayTask[] = []
  for (const mod of modules.value) {
    if (mod.kind === 'goal') {
      for (const t of mod.dailyTasks) {
        tasks.push({ key: `g-${t.id}`, moduleId: mod.id, itemId: t.id, label: t.title, done: t.done, dotClass: KIND_DOT_CLASS.goal, subtitle: mod.title })
      }
    } else if (mod.kind === 'tab') {
      for (const cat of mod.tabCats) {
        for (const it of cat.items) {
          tasks.push({ key: `t-${it.id}`, moduleId: mod.id, itemId: it.id, label: it.name, done: it.done, dotClass: KIND_DOT_CLASS.tab, subtitle: `${mod.title} · ${cat.label}` })
        }
      }
    } else if (mod.kind === 'board') {
      const todoCol = mod.boardColumns.find((c) => c.label === '待辦')
      for (const it of todoCol?.items ?? []) {
        tasks.push({ key: `b-${it.id}`, moduleId: mod.id, itemId: it.id, label: it.name, done: false, dotClass: KIND_DOT_CLASS.board, subtitle: mod.title })
      }
    }
  }
  return tasks
})

const totalCount = computed(() =>
  modules.value.reduce((sum, mod) => {
    if (mod.kind === 'goal') return sum + mod.dailyTasks.length
    if (mod.kind === 'tab') return sum + mod.tabCats.reduce((s, c) => s + c.items.length, 0)
    return sum + mod.boardColumns.reduce((s, c) => s + c.items.length, 0)
  }, 0),
)
const doneCount = computed(() =>
  modules.value.reduce((sum, mod) => {
    if (mod.kind === 'goal') return sum + mod.dailyTasks.filter((t) => t.done).length
    if (mod.kind === 'tab') return sum + mod.tabCats.reduce((s, c) => s + c.items.filter((i) => i.done).length, 0)
    return sum + (mod.boardColumns.find((c) => c.label === '已完成')?.items.length ?? 0)
  }, 0),
)
const donePct = computed(() => (totalCount.value > 0 ? Math.round((doneCount.value / totalCount.value) * 100) : 0))

function findModule(id: string) {
  return modules.value.find((m) => m.id === id)
}

function toggleTask(task: DisplayTask) {
  const mod = findModule(task.moduleId)
  if (!mod) return
  if (mod.kind === 'goal') {
    const t = mod.dailyTasks.find((t) => t.id === task.itemId)
    if (!t) return
    t.done = !t.done
  } else if (mod.kind === 'tab') {
    const item = mod.tabCats.flatMap((c) => c.items).find((i) => i.id === task.itemId)
    if (!item) return
    item.done = !item.done
  } else {
    const todoCol = mod.boardColumns.find((c) => c.label === '待辦')
    const doneCol = mod.boardColumns.find((c) => c.label === '已完成')
    if (!todoCol || !doneCol) return
    const idx = todoCol.items.findIndex((i) => i.id === task.itemId)
    if (idx === -1) return
    const [item] = todoCol.items.splice(idx, 1)
    doneCol.items.push(item)
  }
  void updateCustomModuleWithRetry(mod)
}

// 「✓ 回報完成」「全部完成 ✅」對齊 lineWebhook.ts 的 all_done：把還沒完成的項目全部標記完成
// （看板卡片一樣是搬到「已完成」欄），只對真的有異動的模組發送存檔。
function checkinAllToday() {
  const affected: CustomModule[] = []
  for (const mod of modules.value) {
    if (mod.kind === 'goal') {
      const changed = mod.dailyTasks.some((t) => !t.done)
      mod.dailyTasks.forEach((t) => (t.done = true))
      if (changed) affected.push(mod)
    } else if (mod.kind === 'tab') {
      const items = mod.tabCats.flatMap((c) => c.items)
      const changed = items.some((i) => !i.done)
      items.forEach((i) => (i.done = true))
      if (changed) affected.push(mod)
    } else {
      const todoCol = mod.boardColumns.find((c) => c.label === '待辦')
      const doneCol = mod.boardColumns.find((c) => c.label === '已完成')
      if (todoCol && doneCol && todoCol.items.length > 0) {
        doneCol.items.push(...todoCol.items.splice(0, todoCol.items.length))
        affected.push(mod)
      }
    }
  }
  for (const mod of affected) void updateCustomModuleWithRetry(mod)
}
</script>

<template>
  <div
    class="min-h-screen bg-cream-55 font-normal py-14 px-10"
    style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif"
  >
    <div class="max-w-3xl mx-auto mb-10">
      <div
        class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-line-brand-bg text-teal-brand text-sm font-medium"
      >
        專業版 · LINE 通知
      </div>
      <h1 class="mt-4 text-gray-950 font-medium" style="font-size: 30px; letter-spacing: -0.01em">
        每日代辦推播
      </h1>
      <p class="mt-2 text-gray-500" style="font-size: 15px">
        每天早晨 07:30 推送任務卡到 LINE，鎖定畫面直接看，一鍵回報完成
      </p>
    </div>

    <div class="max-w-3xl mx-auto flex gap-10 flex-wrap justify-center items-start">
      <!-- Screen 1: lock screen push（純示意圖，不可互動） -->
      <div class="flex flex-col items-center gap-3.5">
        <div
          class="w-[280px] h-[500px] rounded-card overflow-hidden flex flex-col px-4 pt-14 pb-6"
          style="
            background: linear-gradient(
              165deg,
              var(--color-teal-dark) 0%,
              var(--color-teal-darker) 40%,
              var(--color-slate-dark) 100%
            );
          "
        >
          <div class="text-center text-white">
            <div class="font-medium opacity-85" style="font-size: 13px">7月8日 星期三</div>
            <div class="font-medium leading-none mt-1" style="font-size: 44px; letter-spacing: -0.02em">
              7:30
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-2.5">
            <div
              class="rounded-card p-3.5"
              style="background: rgba(255, 255, 255, 0.16); border: 0.5px solid rgba(255, 255, 255, 0.18)"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="w-6 h-6 rounded-lg bg-line-brand flex items-center justify-center shrink-0">
                  <span class="w-3 h-2.5 bg-white rounded" style="border-radius: 5px 5px 5px 1px" />
                </span>
                <span class="text-white font-medium text-xs">LINE</span>
                <span class="text-xs" style="color: rgba(255, 255, 255, 0.55)">· WeeklyMind</span>
                <span class="ml-auto text-xs" style="color: rgba(255, 255, 255, 0.55)">現在</span>
              </div>
              <div class="text-white font-medium text-sm">早安！今天有 3 項待辦 ☀️</div>
              <div class="text-xs leading-relaxed mt-1" style="color: rgba(255, 255, 255, 0.82)">
                間歇跑 5km · 閱讀 30 頁 · 補買雞胸肉。點開回報今天的進度。
              </div>
            </div>

            <div
              class="rounded-card px-3.5 py-3"
              style="background: rgba(255, 255, 255, 0.12); border: 0.5px solid rgba(255, 255, 255, 0.14)"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-5.5 h-5.5 rounded-lg bg-line-brand flex items-center justify-center shrink-0">
                  <span class="w-3 h-2 bg-white rounded" style="border-radius: 4px 4px 4px 1px" />
                </span>
                <span class="font-medium text-xs" style="color: rgba(255, 255, 255, 0.9)">LINE</span>
                <span class="ml-auto text-xs" style="color: rgba(255, 255, 255, 0.5)">昨天 21:00</span>
              </div>
              <div class="text-xs leading-relaxed" style="color: rgba(255, 255, 255, 0.8)">
                昨日完成率 <b class="text-white">88%</b> 🎉 本週累積達成 76%，繼續保持！
              </div>
            </div>
          </div>

          <div class="mt-auto text-center text-xs" style="color: rgba(255, 255, 255, 0.5)">
            向上滑動查看更多
          </div>
        </div>
        <span class="text-gray-400 font-medium text-sm">鎖定畫面推播</span>
      </div>

      <!-- Screen 2: LINE chat task card（真實資料，打卡按鈕可互動） -->
      <div class="flex flex-col items-center gap-3.5">
        <div class="w-[280px] h-[500px] rounded-card overflow-hidden flex flex-col bg-line-chat-bg">
          <div class="bg-line-brand px-4 py-3.5 flex items-center gap-2.5 shrink-0">
            <span class="text-white text-lg">‹</span>
            <span class="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <span class="font-medium text-sm text-teal-brand">W</span>
            </span>
            <div class="flex-1">
              <div class="text-white font-medium text-sm">WeeklyMind</div>
              <div class="text-xs" style="color: rgba(255, 255, 255, 0.85)">LINE 官方帳號</div>
            </div>
            <span class="text-white text-base">☰</span>
          </div>

          <div class="flex-1 overflow-auto px-3.5 py-4 flex flex-col gap-3">
            <div class="text-center">
              <span
                class="text-white text-xs px-3 py-1 rounded-full"
                style="background: rgba(0, 0, 0, 0.14)"
                >今天 07:30</span
              >
            </div>

            <div class="flex gap-2 items-end">
              <span class="w-7.5 h-7.5 rounded-lg bg-white flex items-center justify-center shrink-0">
                <span class="font-medium text-xs text-teal-brand">W</span>
              </span>
              <div class="bg-white rounded-card px-3.5 py-2.5 max-w-[76%]" style="border-radius: 4px 16px 16px 16px">
                <p class="text-gray-950 text-sm leading-relaxed m-0">早安 ☀️ 這是你今天的代辦清單</p>
              </div>
            </div>

            <div class="flex gap-2 items-end">
              <div class="w-7.5 shrink-0"></div>

              <!-- 未登入：這頁是獨立路由，訪客也進得來，但沒有真實資料可顯示 -->
              <div v-if="!auth.isLoggedIn" class="bg-white rounded-card px-3.5 py-4 max-w-[84%] text-center">
                <p class="m-0 text-xs text-gray-500">登入後才能看到你的真實代辦清單</p>
                <RouterLink :to="{ name: 'login' }" class="mt-2 inline-block text-xs font-medium text-teal-brand">前往登入 →</RouterLink>
              </div>

              <!-- 已登入但還沒有任何計畫 -->
              <div v-else-if="totalCount === 0" class="bg-white rounded-card px-3.5 py-4 max-w-[84%] text-center">
                <p class="m-0 text-xs text-gray-500">尚無代辦事項</p>
                <RouterLink :to="{ name: 'overview' }" class="mt-2 inline-block text-xs font-medium text-teal-brand">先到「計劃管理」新增計畫 →</RouterLink>
              </div>

              <div v-else class="bg-white rounded-card overflow-hidden max-w-[84%]">
                <div class="bg-teal-brand px-4 py-3.5 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium text-base">今日代辦</div>
                      <div class="text-xs opacity-85 mt-0.5">7 月 8 日 · 星期三</div>
                    </div>
                    <div class="text-right">
                      <div class="font-medium leading-none" style="font-size: 22px">{{ doneCount }}/{{ totalCount }}</div>
                      <div class="text-xs opacity-85">已完成</div>
                    </div>
                  </div>
                  <div class="h-1.5 rounded-full mt-3 overflow-hidden" style="background: rgba(255, 255, 255, 0.28)">
                    <div class="h-full bg-white" :style="{ width: donePct + '%' }" />
                  </div>
                </div>
                <div class="px-4 py-3.5 flex flex-col gap-3">
                  <div v-for="task in todayTasks" :key="task.key" class="flex items-center gap-2.5 cursor-pointer" @click="toggleTask(task)">
                    <span
                      class="w-5 h-5 rounded-md shrink-0 flex items-center justify-center text-white"
                      :class="task.done ? 'bg-teal-brand' : 'border-2 border-gray-300'"
                      style="font-size: 11px"
                    >
                      <span v-if="task.done">✓</span>
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-sm" :class="task.done ? 'text-gray-400 line-through' : 'text-gray-950'">{{ task.label }}</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="w-1.5 h-1.5 rounded-full" :class="task.dotClass" />
                        <span class="text-xs text-gray-400">{{ task.subtitle }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex border-t border-gray-100-alt">
                  <div class="flex-1 text-center py-3.5 text-sm font-medium text-teal-brand border-r border-gray-100-alt cursor-pointer" @click="checkinAllToday">
                    ✓ 回報完成
                  </div>
                  <RouterLink :to="{ name: 'overview' }" class="flex-1 text-center py-3.5 text-sm font-medium text-gray-500">查看全部</RouterLink>
                </div>
              </div>
            </div>

            <div class="flex gap-2 justify-end flex-wrap">
              <div
                class="bg-white border border-teal-brand text-teal-brand rounded-full px-4 py-2 text-xs font-medium cursor-pointer"
                @click="checkinAllToday"
              >
                全部完成 ✅
              </div>
              <RouterLink :to="{ name: 'overview' }" class="bg-white border border-gray-300 text-gray-500 rounded-full px-4 py-2 text-xs font-medium">
                調整今日計畫
              </RouterLink>
            </div>
          </div>

          <div class="bg-white px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
            <span class="text-xl text-taupe">＋</span>
            <div class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-350">輸入訊息…</div>
            <span class="text-lg">😊</span>
          </div>
        </div>
        <span class="text-gray-400 font-medium text-sm">LINE 對話 · 任務卡</span>
      </div>
    </div>
  </div>
</template>
