import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export type ProjectStatus = 'todo' | 'doing' | 'done'

export const COLUMN_META: Record<ProjectStatus, { label: string; badgeText: string; badgeBg: string; badgeCol: string }> = {
  todo: { label: '待辦', badgeText: 'TODO', badgeBg: 'bg-cream-100', badgeCol: 'text-clay-500' },
  doing: { label: '進行中', badgeText: 'IN PROGRESS', badgeBg: 'bg-status-inprogress', badgeCol: 'text-white' },
  done: { label: '已完成', badgeText: 'DONE', badgeBg: 'bg-success-bg-soft', badgeCol: 'text-brand-primary' },
}
export const COLUMN_ORDER: ProjectStatus[] = ['todo', 'doing', 'done']

// 資料本體改由 usePortfolioBoard composable（TanStack Query）提供，這裡只留 Modal/表單的 UI 狀態。
export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    modalOpen: false,
    editId: null as string | null,
    form: { name: '', desc: '' },
    touched: false,
  }),
  getters: {
    modalTitle(state): string {
      return state.editId ? '編輯專案' : '新增專案'
    },
  },
  actions: {
    openNewProject() {
      if (!useAuthStore().requireLogin()) return
      this.editId = null
      this.form = { name: '', desc: '' }
      this.touched = false
      this.modalOpen = true
    },
    openEditProject(project: { id: string; name: string; caption: string }) {
      if (!useAuthStore().requireLogin()) return
      this.editId = project.id
      this.form = { name: project.name, desc: project.caption }
      this.touched = false
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
  },
})
