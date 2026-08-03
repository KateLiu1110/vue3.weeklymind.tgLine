import { defineStore } from 'pinia'

export interface LinkItem {
  id: string
  title: string
  url: string
  tag: string
}

export interface LinkColumn {
  id: 'ig' | 'threads' | 'fb'
  label: string
  iconKey: 'camera' | 'threads' | 'facebook'
  items: LinkItem[]
}

export const useLinksStore = defineStore('links', {
  state: () => ({
    columns: [
      {
        id: 'ig',
        label: 'Instagram',
        iconKey: 'camera',
        items: [
          { id: 'ig1', title: '極簡作品集排版參考', url: 'instagram.com/p/portfolio-ref-01', tag: '設計靈感' },
          { id: 'ig2', title: '個人品牌配色案例', url: 'instagram.com/p/brand-color-02', tag: '設計靈感' },
        ],
      },
      {
        id: 'threads',
        label: 'Threads',
        iconKey: 'threads',
        items: [
          { id: 'th1', title: 'React 效能優化心得串', url: 'threads.net/@dev/post/perf-tips', tag: '前端知識' },
          { id: 'th2', title: 'TypeScript 型別技巧整理', url: 'threads.net/@dev/post/ts-tips', tag: '前端知識' },
        ],
      },
      {
        id: 'fb',
        label: 'Facebook',
        iconKey: 'facebook',
        items: [{ id: 'fb1', title: '前端社群求職心得分享', url: 'facebook.com/groups/fe/posts/123', tag: '生活雜記' }],
      },
    ] as LinkColumn[],

    modalOpen: false,
    form: { title: '', url: '', tag: '' },
    touched: false,
  }),
  getters: {
    isEmpty(state): boolean {
      return state.columns.every((c) => c.items.length === 0)
    },
    detectedPlatform(state): { id: 'ig' | 'threads' | 'fb'; label: string } {
      const url = state.form.url.toLowerCase()
      if (url.includes('threads')) return { id: 'threads', label: 'Threads' }
      if (url.includes('facebook') || url.includes('fb.com')) return { id: 'fb', label: 'Facebook' }
      return { id: 'ig', label: 'Instagram' }
    },
  },
  actions: {
    importToPortfolio(colId: string, itemId: string) {
      const col = this.columns.find((c) => c.id === colId)
      if (col) col.items = col.items.filter((i) => i.id !== itemId)
    },
    openLinkModal() {
      this.form = { title: '', url: '', tag: '' }
      this.touched = false
      this.modalOpen = true
    },
    closeLinkModal() {
      this.modalOpen = false
    },
    saveLink() {
      if (!this.form.title.trim() || !this.form.url.trim()) {
        this.touched = true
        return
      }
      const platform = this.detectedPlatform
      const col = this.columns.find((c) => c.id === platform.id)
      if (col) {
        col.items.push({
          id: 'lk' + Date.now(),
          title: this.form.title.trim(),
          url: this.form.url.trim(),
          tag: this.form.tag.trim() || '未分類',
        })
      }
      this.modalOpen = false
    },
  },
})
