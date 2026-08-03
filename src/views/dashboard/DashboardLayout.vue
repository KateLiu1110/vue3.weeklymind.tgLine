<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useCoreStore, type CustomModuleKind } from '@/stores/core'

const core = useCoreStore()
const router = useRouter()

const navItems = [
  { name: 'overview', label: '計畫中心' },
  { name: 'exec', label: '執行中心' },
  { name: 'toeic', label: '多益英文' },
  { name: 'portfolio', label: '作品集看板' },
  { name: 'sport', label: '運動' },
  { name: 'links', label: '連結收藏' },
  { name: 'retro', label: '覆盤中心' },
  { name: 'settings', label: '設定' },
  { name: 'linebot', label: 'LineBot 設定' },
]

const addMenuOpen = ref(false)
const TEMPLATE_OPTIONS: { kind: CustomModuleKind; label: string; defaultTitle: string }[] = [
  { kind: 'goal', label: '新增目標模板', defaultTitle: '新目標' },
  { kind: 'board', label: '新增看板模板', defaultTitle: '新看板' },
  { kind: 'tab', label: '新增 Tab 模板', defaultTitle: '新分類清單' },
]

function addModule(kind: CustomModuleKind, defaultTitle: string) {
  const mod = core.createCustomModule(kind, defaultTitle)
  addMenuOpen.value = false
  router.push({ name: 'custom', params: { id: mod.id } })
}
</script>

<template>
  <div class="min-h-screen flex bg-cream-125 font-normal" style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif">
    <aside class="w-56 shrink-0 bg-cream-50 border-r border-cream-150 flex flex-col gap-1 p-4">
      <div class="flex items-center gap-2 px-2 pb-4">
        <span class="text-2xl">🐾</span>
        <span class="font-medium text-ink-800">WeeklyMind</span>
      </div>
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="px-3 py-2.5 rounded-control text-sm font-medium text-ink-700"
        active-class="bg-brand-primary text-white"
      >
        {{ item.label }}
      </RouterLink>

      <div class="mt-3 px-3 text-xs font-medium text-sand-300 tracking-wide">自訂模組</div>
      <RouterLink
        v-for="mod in core.customModules"
        :key="mod.id"
        :to="{ name: 'custom', params: { id: mod.id } }"
        class="px-3 py-2.5 rounded-control text-sm font-medium text-ink-700 overflow-hidden text-ellipsis whitespace-nowrap"
        active-class="bg-brand-primary text-white"
      >
        {{ mod.title }}
      </RouterLink>

      <div class="relative px-1">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-2 py-2 rounded-control text-sm font-medium text-brand-primary cursor-pointer"
          @click="addMenuOpen = !addMenuOpen"
        >
          ＋ 新增模組
        </button>
        <div v-if="addMenuOpen" class="absolute left-1 top-full mt-1 w-48 bg-cream-50 border border-cream-150 rounded-card shadow-lg z-10 p-1.5">
          <button
            v-for="opt in TEMPLATE_OPTIONS"
            :key="opt.kind"
            type="button"
            class="w-full text-left px-2.5 py-2 rounded-control text-xs font-medium text-ink-700 cursor-pointer hover:bg-cream-100"
            @click="addModule(opt.kind, opt.defaultTitle)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-auto">
      <div class="flex items-center justify-end mb-5">
        <button
          type="button"
          class="px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer"
          :class="core.demoEmpty ? 'border-brand-primary text-brand-primary bg-success-bg-soft' : 'border-sand-200 text-sand-500 bg-transparent'"
          @click="core.toggleDemoEmpty()"
        >
          {{ core.demoEmpty ? '新帳號（空白）' : '有資料帳號' }}
        </button>
      </div>
      <RouterView />
    </main>
  </div>
</template>
