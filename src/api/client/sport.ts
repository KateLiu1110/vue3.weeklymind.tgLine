import { apiClient } from '@/api/transport/axios'
import type { ApiSuccess } from '@/types/api'

export interface SportCategoryTabDto {
  id: string
  name: string
  order: number
}
export interface SportTodoItemDto {
  id: string
  category: string
  name: string
  done: boolean
}
export interface SportPageDto {
  categories: SportCategoryTabDto[]
  todos: SportTodoItemDto[]
}

export async function fetchSportPage(): Promise<SportPageDto> {
  const res = await apiClient.get<ApiSuccess<SportPageDto>>('/sport')
  return res.data.data
}

export async function createSportCategory(name: string): Promise<SportCategoryTabDto> {
  const res = await apiClient.post<ApiSuccess<SportCategoryTabDto>>('/sport/categories', { name })
  return res.data.data
}

export async function deleteSportCategory(id: string): Promise<void> {
  await apiClient.delete(`/sport/categories/${id}`)
}

export async function createSportTodo(input: { category: string; name: string }): Promise<SportTodoItemDto> {
  const res = await apiClient.post<ApiSuccess<SportTodoItemDto>>('/sport/todos', input)
  return res.data.data
}

export async function toggleSportTodo(id: string): Promise<SportTodoItemDto> {
  const res = await apiClient.patch<ApiSuccess<SportTodoItemDto>>(`/sport/todos/${id}/toggle`)
  return res.data.data
}

export async function deleteSportTodo(id: string): Promise<void> {
  await apiClient.delete(`/sport/todos/${id}`)
}
