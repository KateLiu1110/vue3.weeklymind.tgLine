import { defineStore } from 'pinia'

export interface LinkCategoryRule {
  id: string
  iconKey: 'camera' | 'threads' | 'facebook'
  platform: string
  category: string
}

export const AVATAR_OPTIONS = [
  { id: 'default', src: '/assets/mascot-dog-2.png' },
  { id: 'avatar1', src: '/assets/pet-avatar-1.png' },
  { id: 'avatar2', src: '/assets/pet-avatar-2.png' },
  { id: 'avatar3', src: '/assets/pet-avatar-3.png' },
]

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
  getters: {
    avatarSrc(state): string {
      return AVATAR_OPTIONS.find((a) => a.id === state.selectedAvatar)?.src ?? AVATAR_OPTIONS[0].src
    },
  },
  actions: {
    selectAvatar(id: string) {
      this.selectedAvatar = id
    },
  },
})
