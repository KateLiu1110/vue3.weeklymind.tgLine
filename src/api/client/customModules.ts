import { apiClient } from '@/api/transport/axios'
import type { CustomModule } from '@/stores/core'
import type { ApiSuccess, CustomModuleCreateInput, CustomModuleUpdateInput } from '@/types/api'

// 後端不存 activeTabCatId（純畫面用的「目前選哪個分頁」狀態），拿到資料後補一個
// 預設值（第一個分頁）就好，不需要另外存。
type ServerModule = Omit<CustomModule, 'activeTabCatId'>

function withActiveTab(m: ServerModule): CustomModule {
  return { ...m, activeTabCatId: m.tabCats[0]?.id ?? null }
}

export async function fetchCustomModules(): Promise<CustomModule[]> {
  const res = await apiClient.get<ApiSuccess<ServerModule[]>>('/custom-modules')
  return res.data.data.map(withActiveTab)
}

export async function createCustomModule(input: CustomModuleCreateInput): Promise<CustomModule> {
  const res = await apiClient.post<ApiSuccess<ServerModule>>('/custom-modules', input)
  return withActiveTab(res.data.data)
}

// 整份模組（含巢狀子項目）一次覆寫，呼叫端不需要處理回傳值——見
// DashboardLayout.vue 的自動儲存邏輯，本地狀態本來就是最新的，不用再用回應覆蓋回去。
export async function updateCustomModule(id: string, input: CustomModuleUpdateInput): Promise<void> {
  await apiClient.put(`/custom-modules/${id}`, input)
}

export async function deleteCustomModule(id: string): Promise<void> {
  await apiClient.delete(`/custom-modules/${id}`)
}
