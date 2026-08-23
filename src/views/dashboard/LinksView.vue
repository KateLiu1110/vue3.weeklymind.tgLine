<script setup lang="ts">
import { computed } from 'vue'
import { useLinksStore } from '@/stores/links'
import { useLinks, useLinkMutations } from '@/composables/useLinks'
import { useAuthStore } from '@/stores/auth'
import type { ApiBusinessError } from '@/api/transport/apiBusinessError'
import type { LinkPlatform } from '@/api/client/links'
import Icon from '@/components/common/Icon.vue'
import Modal from '@/components/common/Modal.vue'
import LockedFeature from '@/components/common/LockedFeature.vue'

const links = useLinksStore()
const auth = useAuthStore()
const linksQuery = useLinks()
const { createLinkMutation, deleteLinkMutation } = useLinkMutations()

const isLocked = computed(
  () => !auth.isLoggedIn || (linksQuery.error.value as ApiBusinessError | null)?.code === 'FEATURE_LOCKED',
)

const PLATFORM_META: Record<LinkPlatform, { label: string; iconKey: string }> = {
  ig: { label: 'Instagram', iconKey: 'camera' },
  threads: { label: 'Threads', iconKey: 'threads' },
  fb: { label: 'Facebook', iconKey: 'facebook' },
  other: { label: '其他', iconKey: 'navLink' },
}
const PLATFORM_ORDER: LinkPlatform[] = ['ig', 'threads', 'fb']

const columns = computed(() => {
  const items = linksQuery.data.value ?? []
  return PLATFORM_ORDER.map((id) => ({
    id,
    ...PLATFORM_META[id],
    items: items.filter((i) => i.platform === id),
  }))
})

function submitLink() {
  if (!links.form.title.trim() || !links.form.url.trim()) {
    links.touched = true
    return
  }
  createLinkMutation.mutate({ title: links.form.title.trim(), url: links.form.url.trim(), category: links.form.tag.trim() || '未分類' })
  links.closeLinkModal()
}
</script>

<template>
  <div>
    <LockedFeature
      v-if="isLocked"
      title="連結收藏尚未解鎖"
      hint="這個工具還在整理，之後開放時會通知你"
    />
    <template v-else>
      <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <p class="m-0 text-xs text-sand-600 flex-1 min-w-[240px]">
          在 LINE 貼上連結，會自動依平台分類歸檔，這裡也可以手動新增。
        </p>
        <button
          type="button"
          class="bg-brand-primary text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer whitespace-nowrap shrink-0"
          @click="links.openLinkModal()"
        >
          ＋ 新增連結
        </button>
      </div>

      <div
        v-if="(linksQuery.data.value ?? []).length === 0"
        class="rounded-card p-8 text-center text-sand-400 bg-cream-50 border border-cream-150"
      >
        <Icon name="plusCircle" :size="30" class="mx-auto" />
        <p class="mt-2.5 mb-0.5 text-sm font-medium text-sand-600">尚未收藏任何連結</p>
        <p class="m-0 text-xs text-sand-400">在 LINE 貼上 IG / Threads / FB 連結，會自動歸類到這裡</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="col in columns" :key="col.id" class="bg-cream-100 rounded-card p-3 min-h-[320px]">
          <div class="flex items-center gap-2 px-1.5 pb-3">
            <Icon :name="col.iconKey" :size="16" class="text-ink-700" />
            <span class="text-xs font-medium text-ink-700 flex-1">{{ col.label }}</span>
            <span class="text-xs bg-white text-sand-500 px-2 py-0.5 rounded-full">{{ col.items.length }}</span>
          </div>
          <div class="flex flex-col gap-2.5">
            <div
              v-for="item in col.items"
              :key="item.id"
              class="group bg-cream-50 border border-cream-150 rounded-card overflow-hidden"
            >
              <div class="h-22 bg-cream-150 flex items-center justify-center">
                <Icon :name="col.iconKey" :size="28" class="text-sand-500" />
              </div>
              <div class="p-3.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-ink-900">{{ item.title }}</span>
                  <span class="flex items-center gap-1.5 shrink-0">
                    <span class="text-xs bg-success-bg-soft text-brand-primary px-2 py-0.5 rounded-full">{{ item.category }}</span>
                    <span class="opacity-0 group-hover:opacity-100 cursor-pointer text-danger" @click="deleteLinkMutation.mutate(item.id)">
                      <Icon name="trash" :size="12" />
                    </span>
                  </span>
                </div>
                <p class="mt-1.5 mb-0 text-xs text-sand-500 leading-relaxed break-all">{{ item.url }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Modal v-if="links.modalOpen" title="新增連結" @close="links.closeLinkModal()">
      <label class="text-xs font-medium text-ink-700">標題</label>
      <input
        v-model="links.form.title"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="links.touched && !links.form.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">連結網址</label>
      <input
        v-model="links.form.url"
        placeholder="https://..."
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="links.touched && !links.form.url.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">平台（依網址自動偵測）</label>
      <div class="mt-1.5 mb-3.5 px-3 py-2.5 rounded-control bg-cream-100 text-sm text-ink-700 font-medium">
        {{ links.detectedPlatform.label }}
      </div>
      <label class="text-xs font-medium text-ink-700">分類標籤（選填）</label>
      <input
        v-model="links.form.tag"
        placeholder="例：設計靈感"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none"
      />
      <p v-if="links.touched && (!links.form.title.trim() || !links.form.url.trim())" class="text-danger text-xs mb-2.5">
        ⚠ 請填寫標題與連結網址
      </p>
      <div class="flex gap-2.5 mt-2">
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer"
          @click="links.closeLinkModal()"
        >
          取消
        </button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer"
          @click="submitLink"
        >
          儲存
        </button>
      </div>
    </Modal>
  </div>
</template>
