<script setup lang="ts">
import { useSportStore } from '@/stores/sport'
import Icon from '@/components/common/Icon.vue'
import Modal from '@/components/common/Modal.vue'

const sport = useSportStore()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4.5 flex-wrap gap-2.5">
      <div class="flex items-center gap-2 flex-wrap">
        <span
          v-for="cat in sport.categories"
          :key="cat"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full cursor-pointer text-sm font-medium"
          :class="sport.activeCategory === cat ? 'bg-brand-primary text-white' : 'bg-cream-100 text-ink-700'"
          @click="sport.setCategory(cat)"
        >
          {{ cat }}
          <span class="opacity-60 text-xs" @click.stop="sport.deleteCategory(cat)">✕</span>
        </span>
        <span
          class="w-8 h-8 rounded-full border-[1.5px] border-dashed border-sand-275 flex items-center justify-center cursor-pointer text-ink-700 text-base font-medium"
          @click="sport.openTabAdd()"
        >
          +
        </span>
      </div>
      <button
        type="button"
        class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer"
        @click="sport.openSportModal()"
      >
        + 新增運動
      </button>
    </div>

    <div v-if="sport.tabAddMode" class="flex gap-2 -mt-2.5 mb-4.5">
      <input
        v-model="sport.tabAddText"
        placeholder="輸入新分頁名稱"
        class="flex-1 max-w-[220px] px-3 py-2 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
        @keyup.enter="sport.confirmTabAdd()"
      />
      <button type="button" class="px-3.5 py-2 rounded-control bg-brand-primary text-white text-xs font-medium cursor-pointer" @click="sport.confirmTabAdd()">
        新增
      </button>
      <button type="button" class="px-3 py-2 rounded-control border border-sand-200 text-ink-700 text-xs cursor-pointer" @click="sport.cancelTabAdd()">
        取消
      </button>
    </div>

    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="text-sm font-medium text-ink-800 mb-3">{{ sport.activeCategory }} 運動清單</div>
      <div v-if="sport.currentTodos.length > 0" class="flex flex-col gap-2.5">
        <div v-for="item in sport.currentTodos" :key="item.id" class="flex items-center gap-2.5 py-2 border-b border-cream-160">
          <span
            class="w-4.5 h-4.5 rounded-md shrink-0 cursor-pointer flex items-center justify-center text-white text-xs"
            :class="item.done ? 'bg-brand-primary' : 'border-2 border-sand-250'"
            @click="sport.toggleTodo(item.id)"
          >
            <span v-if="item.done">✓</span>
          </span>
          <div class="flex-1 min-w-0 text-sm overflow-hidden text-ellipsis whitespace-nowrap" :class="item.done ? 'text-sand-400 line-through' : 'text-ink-900'">
            {{ item.name }}
          </div>
          <span class="cursor-pointer text-sand-500 shrink-0 flex"><Icon name="edit" :size="14" /></span>
          <span class="cursor-pointer text-danger shrink-0 flex" @click="sport.deleteTodo(item.id)"><Icon name="trash" :size="14" /></span>
        </div>
      </div>
      <div v-else class="text-center py-5 px-1">
        <p class="m-0 text-xs font-medium text-sand-600">「{{ sport.activeCategory }}」尚無項目</p>
        <p class="mt-1 mb-0 text-xs text-sand-400">點擊「＋ 新增運動」建立第一筆紀錄</p>
      </div>
    </div>

    <Modal v-if="sport.modalOpen" title="新增運動" :width="440" @close="sport.closeSportModal()">
      <label class="text-xs font-medium text-ink-700">運動名稱</label>
      <input
        v-model="sport.form.name"
        placeholder="例：晨間慢跑 5 公里"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="sport.touched && !sport.form.name.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">運動分類（選填）</label>
      <select v-model="sport.form.category" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none">
        <option value="">不分類</option>
        <option v-for="cat in sport.categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <label class="text-xs font-medium text-ink-700">貼上連結（圖片 / 影片，選填）</label>
      <input
        v-model="sport.form.link"
        placeholder="https://..."
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
      />
      <p v-if="sport.touched && !sport.form.name.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫運動名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer"
          @click="sport.closeSportModal()"
        >
          取消
        </button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer"
          @click="sport.saveSportForm()"
        >
          儲存
        </button>
      </div>
    </Modal>
  </div>
</template>
