<script setup lang="ts">
import { computed, reactive } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useCoreStore } from '@/stores/core'
import Icon from '@/components/common/Icon.vue'

const props = defineProps<{ moduleId: string }>()
const core = useCoreStore()
const mod = computed(() => core.customModules.find((m) => m.id === props.moduleId)!)

const colAdd = reactive({ open: false, text: '' })
function confirmAddColumn() {
  const label = colAdd.text.trim()
  if (!label) return
  mod.value.boardColumns.push({ id: 'col' + Date.now(), label, deletable: true, items: [] })
  colAdd.text = ''
  colAdd.open = false
}

function deleteColumn(id: string) {
  mod.value.boardColumns = mod.value.boardColumns.filter((c) => c.id !== id)
}

const newProject = reactive({ name: '', caption: '' })
function addProject() {
  const name = newProject.name.trim()
  if (!name || mod.value.boardColumns.length === 0) return
  mod.value.boardColumns[0].items.push({ id: 'p' + Date.now(), name, caption: newProject.caption.trim() })
  newProject.name = ''
  newProject.caption = ''
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2.5">
      <p class="m-0 text-xs text-sand-600">拖曳卡片切換狀態，點擊卡片查看/編輯詳細內容</p>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="bg-white border border-sand-200 text-ink-700 text-xs font-medium px-4 py-2 rounded-full cursor-pointer"
          @click="colAdd.open = !colAdd.open"
        >
          ＋ 新增看板區
        </button>
        <input v-model="newProject.name" placeholder="任務名稱" class="text-xs px-2.5 py-2 rounded-control border border-sand-200 outline-none w-28" />
        <input v-model="newProject.caption" placeholder="敘述" class="text-xs px-2.5 py-2 rounded-control border border-sand-200 outline-none w-28" />
        <button type="button" class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer" @click="addProject">
          + 新增任務
        </button>
      </div>
    </div>

    <div v-if="colAdd.open" class="flex gap-2 mb-3.5">
      <input
        v-model="colAdd.text"
        placeholder="輸入看板區名稱"
        class="flex-1 max-w-[220px] px-3 py-2 rounded-control border border-sand-200 outline-none text-sm text-ink-900"
        @keyup.enter="confirmAddColumn"
      />
      <button type="button" class="px-3.5 py-2 rounded-control bg-brand-primary text-white text-xs font-medium cursor-pointer" @click="confirmAddColumn">
        新增
      </button>
      <button type="button" class="px-3 py-2 rounded-control border border-sand-200 text-ink-700 text-xs cursor-pointer" @click="colAdd.open = false">
        取消
      </button>
    </div>

    <div class="flex gap-4 overflow-x-auto pb-1">
      <div v-for="col in mod.boardColumns" :key="col.id" class="bg-cream-100 rounded-card p-3 min-h-[420px] flex-1 min-w-[220px]">
        <div class="flex items-center justify-between px-1.5 pb-3 gap-1.5">
          <span class="text-xs font-medium text-ink-700 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ col.label }}</span>
          <span class="text-xs bg-white text-sand-500 px-2 py-0.5 rounded-full shrink-0">{{ col.items.length }}</span>
          <span v-if="col.deletable" class="cursor-pointer text-danger shrink-0 flex" @click="deleteColumn(col.id)"><Icon name="trash" :size="13" /></span>
        </div>
        <VueDraggable v-model="col.items" group="custom-board-projects" class="flex flex-col gap-2.5 min-h-[60px]" :animation="150">
          <div v-for="proj in col.items" :key="proj.id" class="bg-cream-50 border border-cream-150 rounded-card p-3.5 cursor-grab active:cursor-grabbing">
            <span class="text-sm font-medium text-ink-900">{{ proj.name }}</span>
            <p v-if="proj.caption" class="mt-1.5 mb-0 text-xs text-sand-500 leading-relaxed">{{ proj.caption }}</p>
          </div>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>
