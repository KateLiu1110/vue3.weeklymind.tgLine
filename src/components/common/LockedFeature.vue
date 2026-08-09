<script setup lang="ts">
import Icon from '@/components/common/Icon.vue'

defineProps<{ title: string; hint: string }>()
</script>

<template>
  <div class="rounded-card p-10 text-center bg-cream-50 border border-cream-150">
    <div class="w-14 h-14 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-3">
      <Icon name="lock" :size="22" class="text-sand-400" />
    </div>
    <p class="m-0 mb-1 text-sm font-medium text-ink-800">{{ title }}</p>
    <p class="m-0 text-xs text-sand-500">{{ hint }}</p>
  </div>
</template>
