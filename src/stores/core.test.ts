import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/client/plans', () => ({
  createPlan: vi.fn(async (payload) => ({
    id: 'plan-1',
    ...payload,
  })),
  deletePlan: vi.fn(async () => undefined),
}))

vi.mock('@/api/client/milestones', () => ({
  createMilestone: vi.fn(async (payload) => ({
    id: 'ms-1',
    ...payload,
  })),
}))

vi.mock('@/plugins/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    requireLogin: () => true,
    isLoggedIn: true,
  }),
}))

import { useCoreStore } from './core'
import { createPlan } from '@/api/client/plans'

describe('core store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('togglePlanWeekday adds and removes weekday selection', () => {
    const store = useCoreStore()
    store.planForm.weekdays = []

    store.togglePlanWeekday(1)
    expect(store.planForm.weekdays).toEqual([1])

    store.togglePlanWeekday(1)
    expect(store.planForm.weekdays).toEqual([])
  })

  it('savePlan creates plan and custom module with linkedCustomId', async () => {
    const store = useCoreStore()
    store.planForm = {
      title: '學習計畫',
      sub: '每天 30 分鐘',
      template: 'goal',
      weekdays: [1, 2],
      startTime: '07:00',
      endTime: '08:00',
      months: '1',
    }

    await store.savePlan()

    expect(createPlan).toHaveBeenCalledTimes(1)
    expect(store.plans).toHaveLength(1)
    expect(store.customModules).toHaveLength(1)
    expect(store.plans[0].linkedCustomId).toBe(store.customModules[0].id)
  })

  it('saveDailyTask adds a task to the active custom module', () => {
    const store = useCoreStore()
    const mod = store.createCustomModule('goal', '目標模板')
    store.activeCustomId = mod.id
    store.dailyTaskForm.title = '背 20 個單字'

    store.saveDailyTask()

    expect(mod.dailyTasks).toHaveLength(1)
    expect(mod.dailyTasks[0].title).toBe('背 20 個單字')
  })

  it('deleteCustomModule removes the selected custom module', () => {
    const store = useCoreStore()
    const first = store.createCustomModule('goal', '目標模板')
    const second = store.createCustomModule('board', '看板模板')
    store.activeCustomId = second.id

    store.deleteCustomModule(first.id)

    expect(store.customModules.some((m) => m.id === first.id)).toBe(false)
    expect(store.activeCustomId).toBe(second.id)
  })
})
