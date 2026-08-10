<script setup lang="ts">
import { computed } from 'vue'
import { useCoreStore } from '@/stores/core'
import { AVATAR_OPTIONS, useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useAchievements } from '@/composables/useAchievements'
import { ACHIEVEMENT_KEYS } from '@/api/client/achievements'
import { updatePreferences } from '@/api/client/preferences'
import Icon from '@/components/common/Icon.vue'

const core = useCoreStore()
const settings = useSettingsStore()
const auth = useAuthStore()

const avatarOptions = AVATAR_OPTIONS

const THEME_SERIES = [
  { id: 'ocean', labelZh: '海洋系列', labelEn: 'Ocean Series', swatches: ['#0A4D7C', '#1A7BB9', '#2EAEE0', '#A8DFEF', '#E8F7FC'] },
  { id: 'starry', labelZh: '星空系列', labelEn: 'Starry Night Series', swatches: ['#1A0A3D', '#3D1F7A', '#7B4FC4', '#C4A8F0', '#F0EAFF'] },
  { id: 'sakura', labelZh: '櫻花系列', labelEn: 'Sakura Series', swatches: ['#8B2252', '#C4547A', '#E88FAA', '#F5C8D8', '#FFF0F5'] },
]

const achievementsQuery = useAchievements()
const isThemeLocked = computed(
  () => auth.isLoggedIn && !(achievementsQuery.data.value ?? []).includes(ACHIEVEMENT_KEYS.theme),
)

async function selectTheme(themeId: string) {
  if (!auth.requireLogin()) return
  if (isThemeLocked.value) return
  const updated = await updatePreferences({ theme: themeId })
  if (auth.user) auth.user.theme = updated.theme
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="text-sm font-medium text-ink-800 mb-3">通訊軟體綁定</div>
      <div class="flex gap-2.5">
        <button
          type="button"
          class="flex-1 flex items-center gap-3 p-3.5 rounded-card cursor-pointer border"
          :class="core.botPlatform === 'line' ? 'bg-success-bg-soft border-brand-primary' : 'bg-transparent border-cream-150'"
          @click="core.setBotPlatform('line')"
        >
          <span class="w-10 h-10 rounded-xl bg-line-brand flex items-center justify-center shrink-0 text-white text-base">L</span>
          <span class="flex-1 text-left">
            <div class="text-sm font-medium text-ink-900">LINE</div>
            <div class="text-xs mt-0.5" :class="core.botPlatform === 'line' ? 'text-brand-primary' : 'text-sand-500'">
              {{ core.botPlatform === 'line' ? '已綁定・目前使用中' : '未綁定' }}
            </div>
          </span>
        </button>
        <button
          type="button"
          class="flex-1 flex items-center gap-3 p-3.5 rounded-card cursor-pointer border"
          :class="core.botPlatform === 'telegram' ? 'bg-blue-bg-soft border-telegram-brand' : 'bg-transparent border-cream-150'"
          @click="core.setBotPlatform('telegram')"
        >
          <span class="w-10 h-10 rounded-xl bg-telegram-brand flex items-center justify-center shrink-0 text-white text-base">T</span>
          <span class="flex-1 text-left">
            <div class="text-sm font-medium text-ink-900">Telegram</div>
            <div class="text-xs mt-0.5" :class="core.botPlatform === 'telegram' ? 'text-telegram-brand' : 'text-sand-500'">
              {{ core.botPlatform === 'telegram' ? '已綁定・目前使用中' : '未綁定' }}
            </div>
          </span>
        </button>
      </div>
      <p class="mt-3 mb-0 text-xs text-sand-400">切換後，登入 / 註冊頁的帳號綁定方式會跟著改變</p>
    </div>

    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="text-sm font-medium text-ink-800 mb-3">寵物頭像</div>
      <p class="m-0 mb-3.5 text-xs text-sand-600">選擇一張頭像，會顯示在側邊欄、右上角與里程碑卡片</p>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="av in avatarOptions"
          :key="av.id"
          type="button"
          class="w-14 h-14 rounded-2xl cursor-pointer overflow-hidden bg-cream-100 border-2"
          :class="settings.selectedAvatar === av.id ? 'border-brand-primary' : 'border-transparent'"
          @click="settings.selectAvatar(av.id)"
        >
          <img :src="av.src" class="w-full h-full object-cover" />
        </button>
        <label
          class="w-14 h-14 rounded-2xl border-2 border-dashed border-sand-250 flex items-center justify-center cursor-pointer text-sand-400 text-xl shrink-0"
        >
          ＋
          <input type="file" accept="image/*" class="hidden" />
        </label>
      </div>
    </div>

    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="text-sm font-medium text-ink-800 mb-1 flex items-center gap-1.5">
        <Icon v-if="isThemeLocked" name="lock" :size="14" class="text-sand-400" />
        主題色彩
      </div>
      <p class="m-0 mb-3.5 text-xs text-sand-600">
        {{ isThemeLocked ? '累積打卡達 15 次即可解鎖，選擇喜歡的主題色系' : '選一套喜歡的主題色系，切換後立即套用到整個網站' }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" :class="isThemeLocked ? 'opacity-50 pointer-events-none' : ''">
        <button
          v-for="series in THEME_SERIES"
          :key="series.id"
          type="button"
          class="text-left rounded-card p-3.5 border-2 cursor-pointer"
          :class="auth.user?.theme === series.id ? 'border-brand-primary' : 'border-cream-150'"
          @click="selectTheme(series.id)"
        >
          <div class="text-sm font-medium text-ink-900">{{ series.labelZh }}</div>
          <div class="text-xs text-sand-500 mb-2.5">{{ series.labelEn }}</div>
          <div class="flex gap-1.5">
            <span v-for="c in series.swatches" :key="c" class="w-6 h-6 rounded-full border border-cream-150 shrink-0" :style="{ background: c }" />
          </div>
        </button>
      </div>
    </div>

    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="text-sm font-medium text-ink-800 mb-3">登入資訊</div>
      <div class="flex items-center gap-3.5">
        <div class="flex-1">
          <div class="text-xs text-sand-500 mb-1">手機號碼</div>
          <div class="text-sm text-ink-900 font-medium">{{ settings.phone }}</div>
        </div>
        <span class="text-xs font-medium text-brand-primary cursor-pointer">修改</span>
      </div>
    </div>

    <div class="rounded-card p-5 bg-cream-50 border border-cream-150">
      <div class="flex justify-between items-center mb-3.5">
        <span class="text-sm font-medium text-ink-800">連結分類設定</span>
        <span class="text-xs font-medium text-brand-primary cursor-pointer">+ 新增分類</span>
      </div>
      <p class="m-0 mb-3.5 text-xs text-sand-600">貼上連結時，AI 依平台與關鍵字自動歸類</p>
      <div class="flex flex-col gap-2.5">
        <div
          v-for="rule in settings.linkCategoryRules"
          :key="rule.id"
          class="flex items-center gap-3 p-2.5 bg-cream-125 rounded-control"
        >
          <Icon :name="rule.iconKey" :size="18" class="text-ink-700" />
          <span class="flex-1 text-sm font-medium text-ink-900">{{ rule.platform }}</span>
          <span class="text-xs text-sand-500">→ {{ rule.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
