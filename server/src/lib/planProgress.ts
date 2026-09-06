import { prisma } from '../db.js'

// 計畫完成度（Plan.pct）要跟著自訂模組（目標/看板/Tab 範本）的打勾狀態走，不是手動
// 設定的數字（見 DashboardLayout.vue「新增計畫」Modal 的提示文字：「完成度將依每日
// 打卡自動計算，無須手動設定」）。原本只有 LINE 打卡（lineWebhook.ts）會呼叫這支同步，
// 網頁自己存檔（routes/customModules.ts 的 PUT）沒有呼叫，導致在網頁勾選任務後，
// 「計劃管理」「執行中心」看到的進度環／進度條完全沒反應，要透過 LINE 打卡才會動——
// 兩邊資料各自為政，感覺像沒連動。現在兩邊都呼叫同一支，確保網頁跟 LINE 打卡都會
// 立即反映在 Plan.pct 上。
export async function syncPlanProgress(moduleId: string): Promise<void> {
  const mod = await prisma.customModule.findUnique({
    where: { id: moduleId },
    include: {
      dailyTasks: true,
      tabCats: { include: { items: true } },
      boardColumns: { include: { items: true } },
    },
  })
  if (!mod) return

  let pct = 0
  if (mod.kind === 'goal' && mod.dailyTasks.length > 0) {
    pct = Math.round((mod.dailyTasks.filter((t) => t.done).length / mod.dailyTasks.length) * 100)
  } else if (mod.kind === 'tab') {
    const items = mod.tabCats.flatMap((c) => c.items)
    if (items.length > 0) pct = Math.round((items.filter((i) => i.done).length / items.length) * 100)
  } else if (mod.kind === 'board') {
    const total = mod.boardColumns.reduce((sum, c) => sum + c.items.length, 0)
    const done = mod.boardColumns.find((c) => c.label === '已完成')?.items.length ?? 0
    if (total > 0) pct = Math.round((done / total) * 100)
  }

  await prisma.plan.updateMany({ where: { linkedCustomId: moduleId }, data: { pct } })
}
