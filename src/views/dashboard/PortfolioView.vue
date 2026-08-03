<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { usePortfolioStore } from '@/stores/portfolio'
import Icon from '@/components/common/Icon.vue'
import Modal from '@/components/common/Modal.vue'

const portfolio = usePortfolioStore()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <p class="m-0 text-xs text-sand-600">拖曳卡片切換狀態，點擊卡片查看/編輯詳細內容</p>
      <button
        type="button"
        class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer"
        @click="portfolio.openNewProject()"
      >
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

    <Modal v-if="portfolio.modalOpen" :title="portfolio.modalTitle" :width="480" @close="portfolio.closeModal()">
      <label class="text-xs font-medium text-ink-700">專案名稱</label>
      <input
        v-model="portfolio.form.name"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="portfolio.touched && !portfolio.form.name.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">敘述</label>
      <textarea
        v-model="portfolio.form.desc"
        rows="2"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none resize-y"
      />
      <div class="flex gap-3 mb-3.5">
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">開始日</label>
          <input v-model="portfolio.form.start" type="date" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <label class="text-xs font-medium text-ink-700">完成日</label>
          <input v-model="portfolio.form.end" type="date" class="w-full mt-1.5 px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
      </div>
      <label class="text-xs font-medium text-ink-700">完成度</label>
      <div class="flex gap-2.5 my-1.5 mb-3.5">
        <div class="flex-1">
          <div class="text-xs text-sand-500 mb-1">每日</div>
          <input v-model="portfolio.form.daily" type="number" min="0" max="100" class="w-full px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <div class="text-xs text-sand-500 mb-1">每週</div>
          <input v-model="portfolio.form.weekly" type="number" min="0" max="100" class="w-full px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
        <div class="flex-1">
          <div class="text-xs text-sand-500 mb-1">每月</div>
          <input v-model="portfolio.form.monthly" type="number" min="0" max="100" class="w-full px-2.5 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
        </div>
      </div>
      <p v-if="portfolio.touched && !portfolio.form.name.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫專案名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer"
          @click="portfolio.closeModal()"
        >
          取消
        </button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer"
          @click="portfolio.saveForm()"
        >
          儲存
        </button>
      </div>
    </Modal>
  </div>
</template>
