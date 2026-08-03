<script setup lang="ts">
defineProps<{ caption: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-3.5">
    <div class="w-[280px] h-[500px] rounded-card overflow-hidden flex flex-col bg-line-chat-bg">
      <div class="bg-line-brand px-4 py-3.5 flex items-center gap-2.5 shrink-0">
        <span class="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-lg">🐾</span>
        <div class="flex-1">
          <div class="text-white font-medium text-sm">WeeklyMind</div>
          <div class="text-xs" style="color: rgba(255, 255, 255, 0.85)">LINE 官方帳號</div>
        </div>
        <span class="text-white text-base">☰</span>
      </div>

      <div class="flex-1 overflow-auto px-3.5 py-4 flex flex-col gap-3">
        <slot />
      </div>

      <div class="bg-white px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
        <span class="text-xl text-sand-400">＋</span>
        <div class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-350">輸入訊息…</div>
        <span class="text-lg">😊</span>
      </div>
    </div>
    <span class="text-sand-600 font-medium text-sm">{{ caption }}</span>
  </div>
</template>
