<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoreStore } from '@/stores/core'
import { useAuthStore } from '@/stores/auth'
import { createNewUser } from '@/api/client/auth'
import { baseURL as apiBaseUrl } from '@/api/transport/axios'

const route = useRoute()
const router = useRouter()
const core = useCoreStore()
const auth = useAuthStore()
const newUserLoading = ref(false)
const newUserError = ref('')

async function tryAsNewUser() {
  newUserLoading.value = true
  newUserError.value = ''
  try {
    const { token, user } = await createNewUser()
    auth.setSession(user, token)
    core.resetLocalState()
    router.replace({ name: 'overview' })
  } catch {
    newUserError.value = '建立新帳號失敗，請確認後端伺服器是否已啟動'
  } finally {
    newUserLoading.value = false
  }
}

const lineLoginError = computed(() => {
  if (route.query.error === 'line_login_not_configured') return 'LINE 登入尚未設定，請洽管理員設定 LINE Login Channel'
  if (route.query.error === 'line_login_failed') return 'LINE 登入失敗，請重新嘗試'
  return ''
})

const platformTab = computed(() => {
  const p = core.botPlatform
  return {
    label: p === 'line' ? 'LINE' : 'Telegram',
    btnClass: p === 'line' ? 'bg-line-brand' : 'bg-telegram-brand',
  }
})

function selectPlatform(platform: 'line' | 'telegram') {
  core.setBotPlatform(platform)
}

function loginWithLine() {
  // Telegram 登入還沒實作，這顆按鈕目前只支援 LINE。
  if (core.botPlatform !== 'line') return
  window.location.href = `${apiBaseUrl}/auth/line/login`
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cream-125 p-6 font-normal"
    style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif"
  >
    <div class="w-full max-w-md bg-cream-50 border border-cream-150 rounded-card p-9">
      <div class="flex flex-col items-center gap-2.5 mb-6">
        <img src="/assets/mascot-dog-2.png" class="w-18 h-18 object-contain" />
        <div class="text-center">
          <div class="font-medium text-ink-800" style="font-size: 19px">WeeklyMind</div>
          <p class="text-sand-500 mt-0.5" style="font-size: 12.5px">綁定帳號以繼續你的每週計畫</p>
        </div>
      </div>

      <div class="flex gap-2 mb-3.5">
        <button
          type="button"
          class="flex-1 text-center py-2 rounded-full cursor-pointer font-medium text-xs"
          :class="core.botPlatform === 'line' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'"
          @click="selectPlatform('line')"
        >
          LINE
        </button>
        <button
          type="button"
          class="flex-1 text-center py-2 rounded-full cursor-pointer font-medium text-xs"
          :class="
            core.botPlatform === 'telegram' ? 'bg-brand-primary text-white' : 'bg-transparent text-ink-700'
          "
          @click="selectPlatform('telegram')"
        >
          Telegram
        </button>
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-2.5 w-full text-white font-medium py-3.5 rounded-control cursor-pointer"
        :class="platformTab.btnClass"
        @click="loginWithLine"
      >
        <span class="w-5 h-4 bg-white rounded" style="border-radius: 6px 6px 6px 2px" />
        使用 {{ platformTab.label }} 帳號登入
      </button>
      <p v-if="lineLoginError" class="mt-2.5 text-danger text-xs text-center">⚠ {{ lineLoginError }}</p>

      <div class="flex items-center gap-2.5 my-4.5">
        <span class="flex-1 h-px bg-cream-150" />
        <span class="text-sand-400" style="font-size: 11px">或</span>
        <span class="flex-1 h-px bg-cream-150" />
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-2 w-full text-ink-700 font-medium py-3 rounded-control border border-sand-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="newUserLoading"
        @click="tryAsNewUser"
      >
        {{ newUserLoading ? '建立中…' : '以新人身分體驗（沒有任何資料）' }}
      </button>
      <p v-if="newUserError" class="mt-2.5 text-danger text-xs text-center">⚠ {{ newUserError }}</p>
      <p class="mt-2 text-sand-400 text-center leading-relaxed" style="font-size: 11px">
        直接建立一個全新的空白帳號並登入，適合想先看看沒有任何資料時畫面長怎樣的人
      </p>

      <p class="mt-5 text-sand-400 text-center leading-relaxed" style="font-size: 11.5px">
        第一次用 {{ platformTab.label }} 帳號登入會自動建立帳號，不用另外註冊。<br />
        登入即代表你同意透過 {{ platformTab.label }} 接收每日任務推播與週報告
      </p>
    </div>
  </div>
</template>
