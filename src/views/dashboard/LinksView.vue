<script setup lang="ts">
import { useLinksStore } from '@/stores/links'
import Icon from '@/components/common/Icon.vue'

const links = useLinksStore()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <p class="m-0 text-xs text-sand-600 flex-1 min-w-[240px]">
        在 LINE 貼上連結，AI 依平台自動分類歸檔。點擊卡片可直接匯入作品集看板的靈感任務。
      </p>
      <button type="button" class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer whitespace-nowrap shrink-0">
        ＋ 新增連結
      </button>
    </div>

    <div v-if="links.isEmpty" class="rounded-card p-8 text-center text-sand-400 bg-cream-50 border border-cream-150">
      <Icon name="plusCircle" :size="30" class="mx-auto" />
      <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">新帳號尚未收藏任何連結</p>
      <p class="m-0 text-xs text-sand-400">在 LINE 貼上 IG / Threads / FB 連結，會自動歸類到這裡</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="col in links.columns" :key="col.id" class="bg-cream-100 rounded-card p-3 min-h-[320px]">
        <div class="flex items-center gap-2 px-1.5 pb-3">
          <Icon :name="col.iconKey" :size="16" class="text-ink-700" />
          <span class="text-xs font-medium text-ink-700 flex-1">{{ col.label }}</span>
          <span class="text-xs bg-white text-sand-500 px-2 py-0.5 rounded-full">{{ col.items.length }}</span>
        </div>
        <div class="flex flex-col gap-2.5">
          <div
            v-for="item in col.items"
            :key="item.id"
            class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden cursor-pointer"
            @click="links.importToPortfolio(col.id, item.id)"
          >
            <div class="h-22 bg-cream-150 flex items-center justify-center">
              <Icon :name="col.iconKey" :size="28" class="text-sand-500" />
            </div>
            <div class="p-3.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium text-ink-900">{{ item.title }}</span>
                <span class="text-xs bg-success-bg-soft text-brand-primary px-2 py-0.5 rounded-full shrink-0">{{ item.tag }}</span>
              </div>
              <p class="mt-1.5 mb-0 text-xs text-sand-500 leading-relaxed break-all">{{ item.url }}</p>
              <div class="text-xs font-medium text-brand-primary mt-2">點擊匯入作品集</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
