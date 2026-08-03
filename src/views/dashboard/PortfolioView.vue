<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { usePortfolioStore } from '@/stores/portfolio'
import Icon from '@/components/common/Icon.vue'

const portfolio = usePortfolioStore()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <p class="m-0 text-xs text-sand-600">拖曳卡片切換狀態，點擊卡片查看/編輯詳細內容</p>
      <button type="button" class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer">
        + 新增專案
      </button>
    </div>

    <div v-if="portfolio.isEmpty" class="rounded-card p-8 text-center text-sand-400 bg-cream-50 border border-cream-150">
      <Icon name="plusCircle" :size="30" class="mx-auto" />
      <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">新帳號尚未建立任何作品集專案</p>
      <p class="m-0 text-xs text-sand-400">點擊上方「＋ 新增專案」建立第一個看板卡片</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="col in portfolio.columns" :key="col.id" class="bg-cream-100 rounded-card p-3 min-h-[420px]">
        <div class="flex items-center justify-between px-1.5 pb-3">
          <span class="text-xs font-medium text-ink-700">{{ col.label }}</span>
          <span class="text-xs bg-white text-sand-500 px-2 py-0.5 rounded-full">{{ col.items.length }}</span>
        </div>
        <VueDraggable v-model="col.items" group="portfolio-projects" class="flex flex-col gap-2.5 min-h-[60px]" :animation="150">
          <div
            v-for="proj in col.items"
            :key="proj.id"
            class="bg-cream-50 border border-cream-150 rounded-card p-3.5 cursor-grab active:cursor-grabbing"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-ink-900">{{ proj.name }}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded" :class="[col.badgeBg, col.badgeCol]">{{ col.label }}</span>
            </div>
            <p class="mt-1.5 mb-0 text-xs text-sand-500 leading-relaxed">{{ proj.caption }}</p>
          </div>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>
