import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { RetroGoalDto } from '@/api/client/retro'

const PALETTE = ['#33513f', '#c9a876', '#2f6bd8', '#b08968']

// goals 資料本體改由 useRetroGoals composable（TanStack Query）提供；本週達成率變化／
// 各分類達成率佔比改由 useRetroSummary composable 提供（見 RetroView.vue），這個 store
// 現在只留 Modal/表單的 UI 狀態。
export const useRetroStore = defineStore('retro', {
  state: () => ({
    retroGoalModalOpen: false,
    // null＝新增；有值＝正在編輯這筆目標（見 openRetroGoalModal 的 goal 參數）。
    retroGoalEditId: null as string | null,
    retroGoalForm: { title: '', start: '', totalDays: '', linkedPlanId: '' },
    retroGoalTouched: false,
  }),
  actions: {
    // 不帶 goal＝新增目標；帶 goal＝編輯既有目標（把表單填成該筆目標目前的值，主要是
    // 給「連結計畫」這個後來才加的欄位補選用——舊目標建立時沒有這個選項，只能用編輯
    // 補上，不然只能刪掉重新新增、會遺失原本的 id/建立時間）。
    openRetroGoalModal(goal?: RetroGoalDto) {
      if (!useAuthStore().requireLogin()) return
      this.retroGoalEditId = goal?.id ?? null
      this.retroGoalForm = goal
        ? { title: goal.title, start: goal.start, totalDays: goal.totalDays ? String(goal.totalDays) : '', linkedPlanId: goal.linkedPlanId ?? '' }
        : { title: '', start: '', totalDays: '', linkedPlanId: '' }
      this.retroGoalTouched = false
      this.retroGoalModalOpen = true
    },
    closeRetroGoalModal() {
      this.retroGoalModalOpen = false
    },
    nextColor(existingCount: number): string {
      return PALETTE[existingCount % PALETTE.length]!
    },
  },
})
