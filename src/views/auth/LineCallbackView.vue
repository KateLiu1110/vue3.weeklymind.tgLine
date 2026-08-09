<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setToken } from '@/lib/authToken'
import { fetchMe } from '@/api/client/auth'
import { useAuthStore } from '@/stores/auth'
import { useCoreStore } from '@/stores/core'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const core = useCoreStore()
const errorMessage = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    errorMessage.value = '登入失敗，缺少 token'
    return
  }
  try {
    // fetchMe() 是透過 axios 攔截器讀 localStorage 帶 Authorization header，
    // 所以要先把 token 存起來才能打這支 API。
    setToken(token)
    const user = await fetchMe()
    auth.setSession(user, token)
    core.resetLocalState()
    router.replace({ name: 'overview' })
  } catch {
    errorMessage.value = '登入失敗，請重新嘗試'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-cream-125 p-6 text-center font-normal">
    <div class="w-full max-w-sm bg-cream-50 border border-cream-150 rounded-card p-9">
      <img src="/assets/mascot-dog-2.png" class="w-16 h-16 object-contain mx-auto mb-4" />
      <p v-if="errorMessage" class="text-danger text-sm">⚠ {{ errorMessage }}</p>
      <p v-else class="text-sm text-ink-700">登入中，請稍候…</p>
    </div>
  </div>
</template>
