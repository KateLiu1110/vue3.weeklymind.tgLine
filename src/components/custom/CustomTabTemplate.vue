<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useCoreStore } from '@/stores/core'
import Icon from '@/components/common/Icon.vue'

const props = defineProps<{ moduleId: string }>()
const core = useCoreStore()
const mod = computed(() => core.customModules.find((m) => m.id === props.moduleId)!)

const activeCat = computed(() => mod.value.tabCats.find((c) => c.id === mod.value.activeTabCatId) ?? mod.value.tabCats[0])

function setActive(id: string) {
  mod.value.activeTabCatId = id
}

const catAdd = reactive({ open: false, text: '' })
function confirmAddCat() {
  const label = catAdd.text.trim()
  if (!label) return
  const cat = { id: 'cat' + Date.now(), label, deletable: true, items: [] }
  mod.value.tabCats.push(cat)
  mod.value.activeTabCatId = cat.id
  catAdd.text = ''
  catAdd.open = false
}
function deleteCat(id: string) {
  mod.value.tabCats = mod.value.tabCats.filter((c) => c.id !== id)
  if (mod.value.activeTabCatId === id) {
    mod.value.activeTabCatId = mod.value.tabCats[0]?.id ?? null
  }
}

const newItemName = reactive({ value: '' })
function addItem() {
  const name = newItemName.value.trim()
  if (!name || !activeCat.value) return
  activeCat.value.items.push({ id: 'ti' + Date.now(), name, done: false })
  newItemName.value = ''
}
function toggleItem(id: string) {
  const item = activeCat.value?.items.find((i) => i.id === id)
  if (item) item.done = !item.done
}
function deleteItem(id: string) {
  if (!activeCat.value) return
  activeCat.value.items = activeCat.value.items.filter((i) => i.id !== id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4.5 flex-wrap gap-2.5">
      <div class="flex items-center gap-2 flex-wrap">
        <span
          v-for="cat in mod.tabCats"
          :key="cat.id"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full cursor-pointer text-sm font-medium"
          :class="mod.activeTabCatId === cat.id ? 'bg-brand-primary text-white' : 'bg-cream-100 text-ink-700'"
          @click="setActive(cat.id)"
        >
          {{ cat.label }}
          <span v-if="cat.deletable" class="opacity-70" @click.stop="deleteCat(cat.id)">✕</span>
        </span>
        <span
          class="w-8 h-8 rounded-full border-[1.5px] border-dashed border-sand-275 flex items-center justify-center cursor-pointer text-ink-700 text-base font-medium"
          @click="catAdd.open = !catAdd.open"
        >
          +
        </span>
      </div>
      <div class="flex items-center gap-1.5">
        <input v-model="newItemName.value" placeholder="項目名稱" class="text-xs px-2.5 py-2 rounded-control border border-sand-200 outline-none w-32" @keyup.enter="addItem" />
        <button type="button" class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer" @click="addItem">
          + 新增項目
        </button>
      </div>
    </div>

    <div v-if="catAdd.open" class="flex gap-2 -mt-2 mb-4.5">
      <input
        v-model="catAdd.text"
        placeholder="輸入新分頁名稱"
        class="flex-1 max-w-[220px] px-3 py-2 rounded-control border border-sand-200 outline-none text-sm text-ink-900"
        @keyup.enter="confirmAddCat"
      />
      <button type="button" class="px-3.5 py-2 rounded-control bg-brand-primary text-white text-xs font-medium cursor-pointer" @click="confirmAddCat">
        新增
      </button>
      <button type="button" class="px-3 py-2 rounded-control border border-sand-200 text-ink-700 text-xs cursor-pointer" @click="catAdd.open = false">
        取消
      </button>
    </div>

    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="text-sm font-medium text-ink-800 mb-3">{{ activeCat?.label }} 清單</div>
      <div v-if="activeCat && activeCat.items.length > 0" class="flex flex-col gap-2.5">
        <div v-for="item in activeCat.items" :key="item.id" class="flex items-center gap-2.5 py-2 border-b border-cream-160">
          <span
            class="w-4.5 h-4.5 rounded-md shrink-0 cursor-pointer flex items-center justify-center text-white text-xs"
            :class="item.done ? 'bg-brand-primary' : 'border-2 border-sand-250'"
            @click="toggleItem(item.id)"
          >
            <span v-if="item.done">✓</span>
          </span>
          <div class="flex-1 min-w-0 text-sm overflow-hidden text-ellipsis whitespace-nowrap" :class="item.done ? 'text-sand-400 line-through' : 'text-ink-900'">
            {{ item.name }}
          </div>
          <span class="cursor-pointer text-danger shrink-0 flex" @click="deleteItem(item.id)"><Icon name="trash" :size="14" /></span>
        </div>
      </div>
      <div v-else class="text-center py-5 px-1">
        <p class="m-0 text-xs font-medium text-sand-600">「{{ activeCat?.label }}」尚無項目</p>
        <p class="mt-1 mb-0 text-xs text-sand-400">輸入項目名稱並點擊「＋ 新增項目」建立第一筆紀錄</p>
      </div>
    </div>
  </div>
</template>
