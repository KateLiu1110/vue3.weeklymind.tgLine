import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../db.js'
import { ApiBusinessError } from '../errors/ApiBusinessError.js'
import { requireAuth } from '../middleware/auth.js'
import { notifyNewTask } from '../services/line.js'
import { checkAndNotifyAchievementsSafely } from '../lib/achievements.js'
import { syncPlanProgress } from '../lib/planProgress.js'

export const customModulesRouter = Router()
customModulesRouter.use(requireAuth)

const moduleInclude = {
  dailyTasks: { orderBy: { order: 'asc' } },
  scores: { orderBy: { order: 'asc' } },
  examDates: { orderBy: { order: 'asc' } },
  boardColumns: { orderBy: { order: 'asc' }, include: { items: { orderBy: { order: 'asc' } } } },
  tabCats: { orderBy: { order: 'asc' }, include: { items: { orderBy: { order: 'asc' } } } },
} satisfies Prisma.CustomModuleInclude

type ModuleWithRelations = Prisma.CustomModuleGetPayload<{ include: typeof moduleInclude }>

/** 前端只在乎「內容」，把 order／moduleId／columnId／categoryId 這些資料庫用的欄位剝掉，
 * 形狀對齊 src/stores/core.ts 的 CustomModule 介面。 */
function toModulePayload(m: ModuleWithRelations) {
  return {
    id: m.id,
    kind: m.kind,
    title: m.title,
    heroTitle: m.heroTitle,
    heroDesc: m.heroDesc,
    heroSchedule: m.heroSchedule,
    heroCurrent: m.heroCurrent,
    heroTarget: m.heroTarget,
    examTitle: m.examTitle,
    scoreTitle: m.scoreTitle,
    lastLabel: m.lastLabel,
    lastScore: m.lastScore,
    targetLabel: m.targetLabel,
    targetScore: m.targetScore,
    dailyTasks: m.dailyTasks.map((t) => ({ id: t.id, title: t.title, done: t.done })),
    scores: m.scores.map((s) => ({ id: s.id, label: s.label, value: s.value })),
    examDates: m.examDates.map((e) => ({ id: e.id, title: e.title, date: e.date })),
    boardColumns: m.boardColumns.map((c) => ({
      id: c.id,
      label: c.label,
      deletable: c.deletable,
      items: c.items.map((i) => ({ id: i.id, name: i.name, caption: i.caption })),
    })),
    tabCats: m.tabCats.map((c) => ({
      id: c.id,
      label: c.label,
      deletable: c.deletable,
      items: c.items.map((i) => ({ id: i.id, name: i.name, done: i.done })),
    })),
  }
}

customModulesRouter.get('/', async (req, res) => {
  const modules = await prisma.customModule.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
    include: moduleInclude,
  })
  res.json({ ok: true, data: modules.map(toModulePayload) })
})

const moduleCreateSchema = z.object({
  kind: z.enum(['goal', 'board', 'tab']),
  title: z.string().min(1),
  heroTitle: z.string().optional(),
})

// 「新增計畫」選模板後呼叫一次：goal 模板把標題帶進 heroTitle；board／tab 模板照著前端
// createBlankCustomModule() 的預設值，先建好預設欄位／分頁，跟本地版本行為一致。
customModulesRouter.post('/', async (req, res, next) => {
  try {
    const body = moduleCreateSchema.parse(req.body)
    const created = await prisma.customModule.create({
      data: {
        userId: req.userId,
        kind: body.kind,
        title: body.title,
        heroTitle: body.kind === 'goal' ? (body.heroTitle ?? body.title) : '',
        boardColumns:
          body.kind === 'board'
            ? {
                create: [
                  { label: '待辦', deletable: false, order: 0 },
                  { label: '進行中', deletable: false, order: 1 },
                  { label: '已完成', deletable: false, order: 2 },
                ],
              }
            : undefined,
        tabCats: body.kind === 'tab' ? { create: [{ label: '分類 1', deletable: false, order: 0 }] } : undefined,
      },
      include: moduleInclude,
    })
    res.status(201).json({ ok: true, data: toModulePayload(created) })
  } catch (err) {
    next(err)
  }
})

const modulePutSchema = z.object({
  title: z.string().min(1),
  heroTitle: z.string().optional(),
  heroDesc: z.string().optional(),
  heroSchedule: z.string().optional(),
  heroCurrent: z.string().optional(),
  heroTarget: z.string().optional(),
  examTitle: z.string().optional(),
  scoreTitle: z.string().optional(),
  lastLabel: z.string().optional(),
  lastScore: z.string().optional(),
  targetLabel: z.string().optional(),
  targetScore: z.string().optional(),
  dailyTasks: z.array(z.object({ title: z.string().min(1), done: z.boolean().optional() })).optional(),
  scores: z.array(z.object({ label: z.string().min(1), value: z.number() })).optional(),
  examDates: z.array(z.object({ title: z.string().min(1), date: z.string().min(1) })).optional(),
  boardColumns: z
    .array(
      z.object({
        label: z.string().min(1),
        deletable: z.boolean().optional(),
        items: z.array(z.object({ name: z.string().min(1), caption: z.string().optional() })).optional(),
      }),
    )
    .optional(),
  tabCats: z
    .array(
      z.object({
        label: z.string().min(1),
        deletable: z.boolean().optional(),
        items: z.array(z.object({ name: z.string().min(1), done: z.boolean().optional() })).optional(),
      }),
    )
    .optional(),
})

// 前端把整個模組（含巢狀子項目）當一份文件編輯，所以這裡整包 PUT 覆寫：更新純量欄位，
// 每個子集合先清空再依前端目前的陣列順序重建。畫面上任何一個小動作（打勾、刪一筆、
// 拖曳看板卡片）都是呼叫這支，不做逐項的細粒度 API。
// 「新增任務、或修改現有任務內容都要推播」：比較這次存檔前後、跟這個模組 kind 相關
// 的項目名稱清單（目標看 dailyTasks 的 title、Tab／看板看所有子集合裡 items 的
// name）。這裡沒有跨次存檔穩定的 id 可以比對（每次 PUT 都整批刪掉重建，見下面的
// transaction），只能退而求其次用「陣列位置」比對：位置超出舊清單長度的是新增，
// 同一個位置但名字不同的是修改——前端編輯是直接改原本那筆的 title/name、新增是
// push 到陣列尾端，兩種操作都不會影響其他項目的相對順序，位置比對在這個前提下夠準；
// 唯一會誤判的情境是「純粹拖曳重新排序、內容完全沒改」，這種邊界情況目前先不處理。
// 單純打勾／刪除都不算，因為兩者比的都是 title/name 文字，不受 done 狀態影響。
function getRelevantNames(kind: string, source: { dailyTasks?: { title: string }[]; tabCats?: { items?: { name: string }[] }[]; boardColumns?: { items?: { name: string }[] }[] }): string[] {
  if (kind === 'goal') return (source.dailyTasks ?? []).map((t) => t.title)
  if (kind === 'tab') return (source.tabCats ?? []).flatMap((c) => (c.items ?? []).map((i) => i.name))
  if (kind === 'board') return (source.boardColumns ?? []).flatMap((c) => (c.items ?? []).map((i) => i.name))
  return []
}

function diffTaskNames(oldNames: string[], newNames: string[]): { added: string[]; modified: string[] } {
  const added = newNames.length > oldNames.length ? newNames.slice(oldNames.length) : []
  const modified: string[] = []
  const commonLen = Math.min(oldNames.length, newNames.length)
  for (let i = 0; i < commonLen; i++) {
    if (oldNames[i] !== newNames[i]) modified.push(newNames[i])
  }
  return { added, modified }
}

customModulesRouter.put('/:id', async (req, res, next) => {
  try {
    const body = modulePutSchema.parse(req.body)
    const existing = await prisma.customModule.findUnique({
      where: { id: req.params.id },
      include: {
        dailyTasks: { select: { title: true } },
        tabCats: { include: { items: { select: { name: true } } } },
        boardColumns: { include: { items: { select: { name: true } } } },
      },
    })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('CustomModule')

    const oldNames = getRelevantNames(existing.kind, existing)
    const newNames = getRelevantNames(existing.kind, body)
    const { added: addedNames, modified: modifiedNames } = diffTaskNames(oldNames, newNames)

    const { dailyTasks, scores, examDates, boardColumns, tabCats, ...scalars } = body
    const moduleId = req.params.id

    await prisma.$transaction([
      prisma.customModule.update({ where: { id: moduleId }, data: scalars }),
      prisma.customModuleDailyTask.deleteMany({ where: { moduleId } }),
      prisma.customModuleScore.deleteMany({ where: { moduleId } }),
      prisma.customModuleExamDate.deleteMany({ where: { moduleId } }),
      prisma.customBoardColumn.deleteMany({ where: { moduleId } }),
      prisma.customTabCategory.deleteMany({ where: { moduleId } }),
      ...(dailyTasks?.length
        ? [
            prisma.customModuleDailyTask.createMany({
              data: dailyTasks.map((t, i) => ({ moduleId, title: t.title, done: !!t.done, order: i })),
            }),
          ]
        : []),
      ...(scores?.length
        ? [prisma.customModuleScore.createMany({ data: scores.map((s, i) => ({ moduleId, label: s.label, value: s.value, order: i })) })]
        : []),
      ...(examDates?.length
        ? [prisma.customModuleExamDate.createMany({ data: examDates.map((e, i) => ({ moduleId, title: e.title, date: e.date, order: i })) })]
        : []),
      ...(boardColumns ?? []).map((c, i) =>
        prisma.customBoardColumn.create({
          data: {
            moduleId,
            label: c.label,
            deletable: c.deletable ?? true,
            order: i,
            items: c.items?.length
              ? { create: c.items.map((it, j) => ({ name: it.name, caption: it.caption ?? '', order: j })) }
              : undefined,
          },
        }),
      ),
      ...(tabCats ?? []).map((c, i) =>
        prisma.customTabCategory.create({
          data: {
            moduleId,
            label: c.label,
            deletable: c.deletable ?? true,
            order: i,
            items: c.items?.length
              ? { create: c.items.map((it, j) => ({ name: it.name, done: !!it.done, order: j })) }
              : undefined,
          },
        }),
      ),
    ])

    const updated = await prisma.customModule.findUniqueOrThrow({ where: { id: moduleId }, include: moduleInclude })
    // 網頁存檔也要同步 Plan.pct，跟 LINE 打卡（lineWebhook.ts）共用同一支——不然只有
    // LINE 打卡會反映在「計劃管理」「執行中心」的進度環上，網頁自己打勾完全沒反應。
    await syncPlanProgress(moduleId)
    res.json({ ok: true, data: toModulePayload(updated) })

    if (addedNames.length > 0 || modifiedNames.length > 0) {
      void notifyNewTask(req.userId, existing.title, existing.kind, { added: addedNames, modified: modifiedNames })
    }
    // 目標/看板/Tab 範本打勾是使用者實際打卡的主要途徑，先前只有 Plan 的「今日打卡」
    // 按鈕跟 LINE 訊息會觸發解鎖判斷，這裡漏掉了，導致光靠網頁打勾永遠解鎖不了覆盤
    // 中心／主題色彩（見 lib/achievements.ts 的 getCustomModuleCheckins）。
    void checkAndNotifyAchievementsSafely(req.userId)
  } catch (err) {
    next(err)
  }
})

customModulesRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.customModule.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.userId) throw ApiBusinessError.notFound('CustomModule')
    await prisma.customModule.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
