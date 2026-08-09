import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { createProject, deleteProject, fetchProjects, updateProject, type ProjectDto } from '@/api/client/portfolio'
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

  return { createProjectMutation, updateProjectMutation, deleteProjectMutation }
}
