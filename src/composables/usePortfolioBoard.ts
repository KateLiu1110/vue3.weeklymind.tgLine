import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createProject, deletePortfolioPage, deleteProject, fetchProjects, updateProject, type ProjectDto } from '@/api/client/portfolio'
import { useAuthStore } from '@/stores/auth'

export function useProjects() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.portfolio.all,
    queryFn: fetchProjects,
    enabled: () => auth.isLoggedIn,
  })
}

export function useProjectMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all })

  const createProjectMutation = useMutation({
    mutationFn: (input: { name: string; caption?: string }) => createProject(input),
    onSuccess: invalidate,
  })
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Pick<ProjectDto, 'name' | 'caption' | 'status'>> }) =>
      updateProject(id, input),
    onSuccess: invalidate,
  })
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: invalidate,
  })
  // 側邊欄「刪除」作品集看板頁面：連帶刪掉驅動這個頁面出現在側邊欄的計畫，所以連 plans
  // 也要一起 invalidate，側邊欄才會馬上跟著消失。
  const deletePageMutation = useMutation({
    mutationFn: () => deletePortfolioPage(),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })
    },
  })

  return { createProjectMutation, updateProjectMutation, deleteProjectMutation, deletePageMutation }
}
