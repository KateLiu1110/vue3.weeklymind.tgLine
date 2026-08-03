import { defineStore } from 'pinia'

export interface LinkCategoryRule {
  id: string
  iconKey: 'camera' | 'threads' | 'facebook'
  platform: string
  category: string
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    selectedAvatar: 'default' as string,
    phone: '0912-345-678',
    linkCategoryRules: [
      { id: 'ig', iconKey: 'camera', platform: 'Instagram', category: '設計靈感' },
      { id: 'threads', iconKey: 'threads', platform: 'Threads', category: '前端知識' },
      { id: 'fb', iconKey: 'facebook', platform: 'Facebook', category: '生活雜記' },
    ] as LinkCategoryRule[],
  }),
  actions: {
    selectAvatar(id: string) {
      this.selectedAvatar = id
    },
  },
})
