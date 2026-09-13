import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/api/queryKeys'
import { checkinPlan, createPlan, deletePlan, fetchPlans, updatePlan } from '@/api/client/plans'
import { useAuthStore } from '@/stores/auth'
import { useCoreStore } from '@/stores/core'
import type { PlanCreateInput, PlanUpdateInput } from '@/types/api'

export function usePlans() {
  const auth = useAuthStore()
  return useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: fetchPlans,
    // 訪客沒有 token，這支 API 一定回 401——乾脆不要打，讓畫面直接呈現空狀態。
    enabled: () => auth.isLoggedIn,
  })
}

export function usePlanMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.plans.all })

  const createPlanMutation = useMutation({
    mutationFn: (input: PlanCreateInput) => createPlan(input),
    onSuccess: invalidate,
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanUpdateInput }) => updatePlan(id, input),
    onSuccess: invalidate,
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: invalidate,
  })

  const checkinPlanMutation = useMutation({
    mutationFn: (id: string) => checkinPlan(id),
    onSuccess: (plan) => {
      // DashboardLayout 的 plans query watch 只在 core.plans 還是空陣列時才會套用
      // 回來的資料（避免蓋掉剛新增、query 還沒看到的項目），所以這裡 invalidate()
      // 觸發的 refetch 不會自動反映到畫面——打卡數要直接寫回 core.plans，
      // 不然按鈕點了但畫面上的次數不會 +1（要重新整理頁面才看得到）。
      // 只合併 checkinsDone 這個打卡 API 真正改到的欄位，不要整包用回應蓋掉本地
      // plan：ExecView 的 checkin() 在呼叫這支 mutation 前，會先把對應自訂模組的
      // 下一個任務標記完成，本地 watch 立即算出新的 pct；打卡 API 的回應是舊的
      // pct（伺服器要等模組那筆 debounce PUT 送到才會重算），整包蓋掉會把剛算好
      // 的進度環蓋回舊值，看起來像「打卡完全沒反應在進度上」。
      const core = useCoreStore()
      core.plans = core.plans.map((p) => (p.id === plan.id ? { ...p, checkinsDone: plan.checkinsDone } : p))
      invalidate()
      // 打卡次數會影響覆盤中心的解鎖條件，順便讓側邊欄鎖定狀態跟著更新。
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all })
    },
  })

  return { createPlanMutation, updatePlanMutation, deletePlanMutation, checkinPlanMutation }
}
