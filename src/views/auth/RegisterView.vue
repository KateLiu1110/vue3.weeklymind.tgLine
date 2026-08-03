<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { useCoreStore } from '@/stores/core'

const router = useRouter()
const core = useCoreStore()

const codeSent = ref(false)
const submitAttempted = ref(false)

const { handleSubmit } = useForm({
  validationSchema: {
    name: (value: unknown) => (typeof value === 'string' && value.trim() ? true : '請填寫暱稱'),
    phone: (value: unknown) => (typeof value === 'string' && value.trim() ? true : '請填寫手機號碼'),
  },
})
const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: phone, errorMessage: phoneError } = useField<string>('phone')

const showError = computed(() => submitAttempted.value && !!(nameError.value || phoneError.value))

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

const sendCode = handleSubmit(
  () => {
    codeSent.value = true
  },
  () => {
    submitAttempted.value = true
  },
)

function register() {
  router.push({ name: 'overview' })
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
          <div class="font-medium text-ink-800" style="font-size: 19px">建立帳號</div>
          <p class="text-sand-500 mt-0.5" style="font-size: 12.5px">開始你的第一份週計畫</p>
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
      >
        <span class="w-5 h-4 bg-white rounded" style="border-radius: 6px 6px 6px 2px" />
        使用 {{ platformTab.label }} 帳號註冊
      </button>

      <div class="flex items-center gap-2.5 my-5.5">
        <div class="flex-1 h-px bg-cream-150" />
        <span class="text-sand-400 text-xs">或使用手機號碼註冊</span>
        <div class="flex-1 h-px bg-cream-150" />
      </div>

      <label class="text-ink-700 font-medium" style="font-size: 12.5px">暱稱</label>
      <input
        v-model="name"
        type="text"
        placeholder="例：豆豆的把拔"
        class="w-full mt-1.5 mb-4 px-3.5 py-3 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="submitAttempted && nameError ? 'border-coral' : 'border-sand-200'"
      />

      <label class="text-ink-700 font-medium" style="font-size: 12.5px">手機號碼</label>
      <input
        v-model="phone"
        type="tel"
        placeholder="0912-345-678"
        class="w-full mt-1.5 mb-4 px-3.5 py-3 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="submitAttempted && phoneError ? 'border-coral' : 'border-sand-200'"
      />

      <div v-if="codeSent">
        <label class="text-ink-700 font-medium" style="font-size: 12.5px">驗證碼</label>
        <input
          type="text"
          placeholder="輸入 6 位數驗證碼"
          class="w-full mt-1.5 mb-1.5 px-3.5 py-3 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none tracking-widest"
        />
        <div class="text-sand-500 mb-4" style="font-size: 11.5px">
          已發送至你的手機，<span class="text-brand-primary font-medium cursor-pointer">重新發送</span>
        </div>
        <button
          type="button"
          class="block w-full text-center bg-brand-primary text-white font-medium py-3.5 rounded-control cursor-pointer"
          @click="register"
        >
          完成註冊並綁定 {{ platformTab.label }} 通知
        </button>
      </div>
      <template v-else>
        <button
          type="button"
          class="block w-full text-center bg-brand-primary text-white font-medium py-3.5 rounded-control cursor-pointer"
          @click="sendCode"
        >
          發送驗證碼
        </button>
        <p v-if="showError" class="text-danger text-xs mt-2.5 text-center">請填寫暱稱與手機號碼</p>
      </template>

      <RouterLink :to="{ name: 'login' }" class="block text-center mt-3.5 text-sand-600" style="font-size: 12.5px">
        已經有帳號？<span class="text-brand-primary font-medium">直接登入</span>
      </RouterLink>

      <p class="mt-5 text-sand-400 text-center leading-relaxed" style="font-size: 11.5px">
        註冊即代表你同意透過 {{ platformTab.label }} 接收每日任務推播與週報告
      </p>
    </div>
  </div>
</template>
