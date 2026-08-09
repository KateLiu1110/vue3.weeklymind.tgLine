import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import {
  createAchievement,
  createFocusTask,
  createGrowthGoal,
  createSchedule,
  deleteAchievement,
  deleteFocusTask,
  deleteGrowthGoal,
  deleteSchedule,
  fetchOverviewPage,
  toggleScheduleReminded,
  updateGoalTitle,
} from '@/api/client/overview'
import { useAuthStore } from '@/stores/auth'

export function useOverviewPage() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.overview.all,
    queryFn: fetchOverviewPage,
    enabled: () => auth.isLoggedIn,
  })
}

export function useOverviewMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.overview.all })

  const updateGoalMutation = useMutation({
    mutationFn: (goalTitle: string) => updateGoalTitle(goalTitle),
    onSuccess: invalidate,
  })
  const createScheduleMutation = useMutation({
    mutationFn: (input: { day: string; title: string }) => createSchedule(input),
    onSuccess: invalidate,
  })
  const toggleScheduleMutation = useMutation({
    mutationFn: (id: string) => toggleScheduleReminded(id),
    onSuccess: invalidate,
  })
  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: invalidate,
  })
  const createFocusTaskMutation = useMutation({
    mutationFn: (input: { title: string; module: string; moduleLabel: string; progress: number; due: string }) => createFocusTask(input),
    onSuccess: invalidate,
  })
  const deleteFocusTaskMutation = useMutation({
    mutationFn: (id: string) => deleteFocusTask(id),
    onSuccess: invalidate,
  })
  const createGrowthGoalMutation = useMutation({
    mutationFn: (input: { title: string; sub: string; badgeText: string }) => createGrowthGoal(input),
    onSuccess: invalidate,
  })
  const deleteGrowthGoalMutation = useMutation({
    mutationFn: (id: string) => deleteGrowthGoal(id),
    onSuccess: invalidate,
  })
  const createAchievementMutation = useMutation({
    mutationFn: (text: string) => createAchievement(text),
    onSuccess: invalidate,
  })
  const deleteAchievementMutation = useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: invalidate,
  })

  return {
    updateGoalMutation,
    createScheduleMutation,
    toggleScheduleMutation,
    deleteScheduleMutation,
    createFocusTaskMutation,
    deleteFocusTaskMutation,
    createGrowthGoalMutation,
    deleteGrowthGoalMutation,
    createAchievementMutation,
    deleteAchievementMutation,
  }
}
