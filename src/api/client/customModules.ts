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

// 把本地端的 CustomModule 整理成 PUT 要的形狀：去掉 id/kind（路徑帶 id，kind 建立後不可變）
// 跟 activeTabCatId（純畫面用，不進資料庫）。DashboardLayout.vue 的自動存檔、LineNotifyView.vue
// 的打卡預覽都是同一個「改本地狀態 → 整包 PUT」模式，共用這支避免兩邊各自維護一份欄位清單。
export function toUpdateInput(mod: CustomModule): CustomModuleUpdateInput {
  const { id: _id, kind: _kind, activeTabCatId: _activeTabCatId, ...content } = mod
  return content
}

// 存檔失敗（例如連線瞬斷）不會自動再被觸發，呼叫端通常也只在使用者又做了新動作時
// 才會再存一次；沒人再動它的話這筆存檔就永遠遺失在本地端。這裡自己重試（間隔遞增）
// 而不是只丟給呼叫端的 catch 印一次 log 就放棄。
const SAVE_RETRY_DELAYS_MS = [1000, 3000, 8000]

export async function updateCustomModuleWithRetry(mod: CustomModule, attempt = 0): Promise<void> {
  try {
    await updateCustomModule(mod.id, toUpdateInput(mod))
  } catch (err) {
    if (attempt >= SAVE_RETRY_DELAYS_MS.length) {
      console.error(`[custom-module] 自動存檔失敗，已重試 ${attempt} 次仍失敗，放棄`, err)
      return
    }
    console.warn(`[custom-module] 自動存檔失敗，${SAVE_RETRY_DELAYS_MS[attempt]}ms 後重試（第 ${attempt + 1} 次）`, err)
    await new Promise((resolve) => setTimeout(resolve, SAVE_RETRY_DELAYS_MS[attempt]))
    return updateCustomModuleWithRetry(mod, attempt + 1)
  }
}

export async function deleteCustomModule(id: string): Promise<void> {
  await apiClient.delete(`/custom-modules/${id}`)
}
