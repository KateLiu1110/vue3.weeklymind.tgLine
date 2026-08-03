<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCoreStore } from '@/stores/core'
import Icon from '@/components/common/Icon.vue'
import InlineEditText from '@/components/common/InlineEditText.vue'
import CustomGoalTemplate from '@/components/custom/CustomGoalTemplate.vue'
import CustomBoardTemplate from '@/components/custom/CustomBoardTemplate.vue'
import CustomTabTemplate from '@/components/custom/CustomTabTemplate.vue'

const route = useRoute()
const core = useCoreStore()

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string') core.setCustomTab(id)
  },
  { immediate: true },
)

const mod = computed(() => core.activeCustomModule)
</script>

<template>
  <div v-if="mod">
    <div class="flex items-center justify-between mb-4.5">
      <div class="flex items-center gap-2.5">
        <InlineEditText
          v-model="mod.title"
          placeholder="新增標題"
          display-class="text-base font-medium text-ink-800"
          input-class="text-base font-medium text-ink-800"
        />
        <span class="text-xs font-medium bg-cream-100 text-clay-500 px-2.5 py-1 rounded-full">
          {{ core.templateLabel(mod.kind) }}
        </span>
      </div>
      <span class="cursor-pointer text-danger flex" @click="core.deleteCustomModule(mod.id)">
        <Icon name="trash" :size="16" />
      </span>
    </div>

    <CustomGoalTemplate v-if="mod.kind === 'goal'" :module-id="mod.id" />
    <CustomBoardTemplate v-else-if="mod.kind === 'board'" :module-id="mod.id" />
    <CustomTabTemplate v-else-if="mod.kind === 'tab'" :module-id="mod.id" />
  </div>
  <div v-else class="rounded-card p-10 text-center text-sand-400 bg-cream-50 border border-cream-150">
    <Icon name="plusCircle" :size="30" class="mx-auto" />
    <p class="mt-2.5 mb-0 text-sm font-medium text-sand-600">找不到這個模組，或尚未建立任何自訂模組</p>
  </div>
</template>
