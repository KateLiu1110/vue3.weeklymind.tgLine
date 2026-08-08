<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { confirmLiffLogin } from '@/api/client/liffAuth'

const route = useRoute()
const status = ref<'loading' | 'success' | 'error' | 'not-configured'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const liffId = import.meta.env.VITE_LIFF_ID
  const token = typeof route.query.token === 'string' ? route.query.token : ''

  if (!liffId) {
    status.value = 'not-configured'
    return
  }
  if (!token) {
    status.value = 'error'
    errorMessage.value = '缺少登入 token，請從後台網站重新產生 QR Code'
    return
  }

  try {
    const { default: liff } = await import('@line/liff')
    await liff.init({ liffId })
    if (!liff.isLoggedIn()) {
      liff.login()
      return
    }
    const profile = await liff.getProfile()
    await confirmLiffLogin(token, profile.userId)
    status.value = 'success'
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : '登入失敗，請重新掃描 QR Code'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-cream-125 p-6 text-center font-normal">
    <div class="w-full max-w-sm bg-cream-50 border border-cream-150 rounded-card p-9">
      <img src="/assets/mascot-dog-2.png" class="w-16 h-16 object-contain mx-auto mb-4" />

      <template v-if="status === 'loading'">
        <p class="text-sm text-ink-700">登入中，請稍候…</p>
      </template>
      <template v-else-if="status === 'success'">
        <p class="text-sm font-medium text-brand-primary mb-1.5">登入成功 🎉</p>
        <p class="text-xs text-sand-500">請回到電腦上的後台網站，畫面會自動繼續</p>
      </template>
      <template v-else-if="status === 'not-configured'">
        <p class="text-sm font-medium text-ink-800 mb-1.5">LIFF 尚未設定</p>
        <p class="text-xs text-sand-500">需要先在 LINE Developers Console 建立 LIFF App，並把 LIFF ID 填進 .env 的 VITE_LIFF_ID</p>
      </template>
      <template v-else>
        <p class="text-sm font-medium text-danger mb-1.5">登入失敗</p>
        <p class="text-xs text-sand-500">{{ errorMessage }}</p>
      </template>
    </div>
  </div>
</template>
