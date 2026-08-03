<script setup lang="ts">
withDefaults(defineProps<{ title: string; width?: number }>(), { width: 400 })
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 bg-ink-900/35 flex items-center justify-center z-50 p-4">
    <div
      class="bg-cream-50 rounded-card max-h-[86vh] overflow-auto p-6"
      :style="{ width: '100%', maxWidth: width + 'px' }"
      @click.stop
    >
      <div class="flex items-center justify-between mb-4">
        <span class="text-base font-medium text-ink-800">{{ title }}</span>
        <span class="cursor-pointer text-lg text-sand-500" @click="emit('close')">✕</span>
      </div>
      <slot />
    </div>
  </div>
</template>
