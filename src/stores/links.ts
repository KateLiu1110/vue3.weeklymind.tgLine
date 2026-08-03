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
  }),
  getters: {
    isEmpty(state): boolean {
      return state.columns.every((c) => c.items.length === 0)
    },
  },
  actions: {
    importToPortfolio(colId: string, itemId: string) {
      const col = this.columns.find((c) => c.id === colId)
      if (col) col.items = col.items.filter((i) => i.id !== itemId)
    },
  },
})
