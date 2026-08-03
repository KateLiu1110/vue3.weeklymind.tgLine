import { defineStore } from 'pinia'

export interface Project {
  id: string
  name: string
  caption: string
}

export interface Column {
  id: 'todo' | 'doing' | 'done'
  label: string
  badgeBg: string
  badgeCol: string
  items: Project[]
}

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    columns: [
      {
        id: 'todo',
        label: '待辦',
        badgeBg: 'bg-cream-100',
        badgeCol: 'text-clay-500',
        items: [
          { id: 'rail', name: '台鐵', caption: '訂票流程重新設計' },
          { id: 'ins', name: '保險', caption: '保單比較資訊頁' },
        ],
      },
      {
        id: 'doing',
        label: '進行中',
        badgeBg: 'bg-status-inprogress',
        badgeCol: 'text-white',
        items: [
          { id: 'meal', name: '訂便當', caption: '每日訂餐小工具' },
          { id: 'site', name: '自有網站', caption: '個人網站首頁 + 專案頁' },
          { id: 'intro', name: '英文自我介紹', caption: '面試用 30 秒自介腳本' },
        ],
      },
      {
        id: 'done',
        label: '已完成',
        badgeBg: 'bg-success-bg-soft',
        badgeCol: 'text-brand-primary',
        items: [{ id: 'fe', name: '前端知識', caption: 'React / Vue 筆記整理' }],
      },
    ] as Column[],

    modalOpen: false,
    editId: null as string | null,
    form: { name: '', desc: '', start: '', end: '', daily: '0', weekly: '0', monthly: '0', fileName: '' },
    touched: false,
  }),
  getters: {
    isEmpty(state): boolean {
      return state.columns.every((c) => c.items.length === 0)
    },
    modalTitle(state): string {
      return state.editId ? '編輯專案' : '新增專案'
    },
  },
  actions: {
    openNewProject() {
      this.editId = null
      this.form = { name: '', desc: '', start: '', end: '', daily: '0', weekly: '0', monthly: '0', fileName: '' }
      this.touched = false
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    saveForm() {
      if (!this.form.name.trim()) {
        this.touched = true
        return
      }
      if (this.editId) {
        for (const col of this.columns) {
          const p = col.items.find((x) => x.id === this.editId)
          if (p) {
            p.name = this.form.name.trim()
            p.caption = this.form.desc.trim()
            break
          }
        }
      } else {
        this.columns[0].items.push({ id: 'pj' + Date.now(), name: this.form.name.trim(), caption: this.form.desc.trim() })
      }
      this.modalOpen = false
    },
  },
})
