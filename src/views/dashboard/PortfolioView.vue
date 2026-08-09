<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { usePortfolioStore, COLUMN_META, COLUMN_ORDER, type ProjectStatus } from '@/stores/portfolio'
import { useProjects, useProjectMutations } from '@/composables/usePortfolioBoard'
import type { ProjectDto } from '@/api/client/portfolio'
import Icon from '@/components/common/Icon.vue'
import Modal from '@/components/common/Modal.vue'

const portfolio = usePortfolioStore()
const projectsQuery = useProjects()
const { createProjectMutation, updateProjectMutation, deleteProjectMutation } = useProjectMutations()

const localColumns = ref<Record<ProjectStatus, ProjectDto[]>>({ todo: [], doing: [], done: [] })
watch(
  () => projectsQuery.data.value,
  (projects) => {
    if (!projects) return
    const grouped: Record<ProjectStatus, ProjectDto[]> = { todo: [], doing: [], done: [] }
    for (const p of projects) grouped[p.status].push(p)
    localColumns.value = grouped
  },
  { immediate: true },
)

function onDragEnd() {
  for (const status of COLUMN_ORDER) {
    for (const p of localColumns.value[status]) {
      if (p.status !== status) updateProjectMutation.mutate({ id: p.id, input: { status } })
    }
  }
}

function submitProject() {
  if (!portfolio.form.name.trim()) {
    portfolio.touched = true
    return
  }
  if (portfolio.editId) {
    updateProjectMutation.mutate({ id: portfolio.editId, input: { name: portfolio.form.name.trim(), caption: portfolio.form.desc.trim() } })
  } else {
    createProjectMutation.mutate({ name: portfolio.form.name.trim(), caption: portfolio.form.desc.trim() })
  }
  portfolio.closeModal()
}
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

    <div
      v-if="(projectsQuery.data.value ?? []).length === 0"
      class="rounded-card p-8 text-center text-sand-400 bg-cream-50 border border-cream-150"
    >
      <Icon name="plusCircle" :size="30" class="mx-auto" />
      <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚未建立任何作品集專案</p>
      <p class="m-0 text-xs text-sand-400">點擊上方「＋ 新增專案」建立第一個看板卡片</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="status in COLUMN_ORDER" :key="status" class="flex flex-col bg-cream-100 rounded-card p-3 min-h-[420px]">
        <div class="flex items-center justify-between px-1.5 pb-3">
          <span class="text-xs font-medium text-ink-700">{{ COLUMN_META[status].label }}</span>
          <span class="text-xs bg-white text-sand-500 px-2 py-0.5 rounded-full">{{ localColumns[status].length }}</span>
        </div>
        <VueDraggable
          v-model="localColumns[status]"
          :group="{ name: 'portfolio-projects', pull: true, put: true }"
          class="flex-1 flex flex-col gap-2.5 min-h-[60px]"
          :animation="150"
          :force-fallback="true"
          :fallback-on-body="true"
          @end="onDragEnd"
        >
          <div
            v-for="proj in localColumns[status]"
            :key="proj.id"
            class="group bg-cream-50 border border-cream-150 rounded-card p-3.5 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-ink-900 cursor-pointer" @click="portfolio.openEditProject(proj)">{{ proj.name }}</span>
              <span class="flex items-center gap-1.5 shrink-0">
                <span class="text-xs font-medium px-2 py-0.5 rounded" :class="[COLUMN_META[status].badgeBg, COLUMN_META[status].badgeCol]">
                  {{ COLUMN_META[status].badgeText }}
                </span>
                <span
                  class="opacity-0 group-hover:opacity-100 cursor-pointer text-danger"
                  @click="deleteProjectMutation.mutate(proj.id)"
                >
                  <Icon name="trash" :size="12" />
                </span>
              </span>
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
          @click="submitProject"
        >
          儲存
        </button>
      </div>
    </Modal>
  </div>
</template>
