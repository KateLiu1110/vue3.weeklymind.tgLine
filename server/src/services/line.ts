import { messagingApi } from '@line/bot-sdk'
import type { LinkPlatform } from '@prisma/client'
import { prisma } from '../db.js'
import { t, M, type BotLang } from './lineMessages.js'

export const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '',
})

export async function replyMessages(replyToken: string, messages: messagingApi.Message[]) {
  await lineClient.replyMessage({ replyToken, messages })
}

export async function pushMessages(to: string, messages: messagingApi.Message[]) {
  await lineClient.pushMessage({ to, messages })
}

export function textMessage(text: string): messagingApi.TextMessage {
  return { type: 'text', text }
}

const PLATFORM_ICON: Record<LinkPlatform, string> = {
  ig: '📷',
  threads: '🧵',
  fb: '📘',
  other: '🔗',
}

const PLATFORM_LABEL: Record<LinkPlatform, string> = {
  ig: 'Instagram',
  threads: 'Threads',
  fb: 'Facebook',
  other: '其他',
}

/**
 * Mirrors the "連結自動歸類確認" card from
 * WeeklyMind LINE Bot 互動.dc.html (scene 08).
 */
export function buildLinkClassificationFlex(params: {
  linkId: string
  platform: LinkPlatform
  category: string
}): messagingApi.FlexMessage {
  const { linkId, platform, category } = params
  const icon = PLATFORM_ICON[platform]
  const label = PLATFORM_LABEL[platform]

  const bubble: messagingApi.FlexBubble = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '0px',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#EFE6D3',
          height: '70px',
          justifyContent: 'center',
          alignItems: 'center',
          contents: [{ type: 'text', text: icon, size: '3xl', align: 'center' }],
        },
        {
          type: 'box',
          layout: 'vertical',
          paddingAll: '15px',
          spacing: 'sm',
          contents: [
            { type: 'text', text: `偵測到 ${label} 連結，已自動歸入`, size: 'sm', color: '#3A2E1E', wrap: true },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#EEF3EA',
              cornerRadius: '99px',
              paddingAll: '6px',
              paddingStart: '11px',
              paddingEnd: '11px',
              width: `${category.length * 13 + 40}px`,
              contents: [{ type: 'text', text: `📁 ${category}`, size: 'xs', weight: 'bold', color: '#7C9473' }],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'none',
      contents: [
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          color: '#7C9473',
          action: { type: 'postback', label: '✓ 分類正確', data: `action=confirm_link&id=${linkId}` },
        },
        {
          type: 'button',
          style: 'link',
          height: 'sm',
          color: '#A99A7E',
          action: { type: 'postback', label: '改分類', data: `action=edit_link&id=${linkId}` },
        },
      ],
    },
  }

  return { type: 'flex', altText: `已收藏連結並歸類為「${category}」`, contents: bubble }
}

function taskRow(params: { label: string; done: boolean; data: string; lang: BotLang }): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'horizontal',
    alignItems: 'center',
    paddingAll: 'sm',
    backgroundColor: '#F5EFE6',
    cornerRadius: 'md',
    contents: [
      {
        type: 'text',
        text: `${params.done ? '●' : '○'} ${params.label}`,
        size: 'sm',
        flex: 1,
        gravity: 'center',
        wrap: true,
      },
      {
        type: 'button',
        style: params.done ? 'link' : 'primary',
        height: 'sm',
        color: params.done ? '#A99A7E' : '#416743',
        action: {
          type: 'postback',
          label: params.done ? t(params.lang, 'checklistChecked') : t(params.lang, 'checklistCheckin'),
          data: params.data,
        },
      },
    ],
  }
}

/**
 * 每日打卡 CheckList，供關鍵字觸發（見 routes/lineWebhook.ts）
 * 與排程主動推播（見 services/reminder.ts）共用。
 * TOEIC 與作品集區塊會即時反映該使用者當天的真實資料。
 */
export async function getCheckListFlex(userId: string, lang: BotLang = 'zh'): Promise<messagingApi.FlexBubble> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [toeic, projects, goalModules] = await Promise.all([
    prisma.toeicProgress.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.project.findMany({
      where: { userId, status: 'doing' },
      orderBy: { createdAt: 'asc' },
      take: 2,
    }),
    // 「新增計畫」選目標模板時填的每日任務——文字是使用者自己在後台輸入的，不是寫死的。
    prisma.customModule.findMany({
      where: { userId, kind: 'goal' },
      orderBy: { createdAt: 'asc' },
      include: { dailyTasks: { orderBy: { order: 'asc' } } },
    }),
  ])

  const vocabDone = toeic?.vocabDone ?? false
  const readingDone = toeic?.readingDone ?? false
  const toeicPct = Math.round((((vocabDone ? 1 : 0) + (readingDone ? 1 : 0)) / 2) * 100)
  const projectPct = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.dailyPct, 0) / projects.length)
    : 0
  const goalModulesWithTasks = goalModules.filter((m) => m.dailyTasks.length > 0)

  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: t(lang, 'checklistTitle'),
          weight: 'bold',
          size: 'lg',
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: `📚 ${t(lang, 'checklistToeic')}`,
              weight: 'bold',
              size: 'sm',
              color: '#416743',
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#E0E0E0',
              height: '6px',
              cornerRadius: 'md',
              contents: [
                { type: 'box', layout: 'vertical', backgroundColor: '#416743', width: `${toeicPct}%`, contents: [] },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'sm',
              spacing: 'xs',
              contents: [
                taskRow({
                  label: 'TOEIC 背單字',
                  done: vocabDone,
                  data: new URLSearchParams({ type: 'toeic', field: 'vocab' }).toString(),
                  lang,
                }),
                taskRow({
                  label: 'TOEIC 閱讀測驗',
                  done: readingDone,
                  data: new URLSearchParams({ type: 'toeic', field: 'reading' }).toString(),
                  lang,
                }),
              ],
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: `🎨 ${t(lang, 'checklistPortfolio')}`,
              weight: 'bold',
              size: 'sm',
              color: '#416743',
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#E0E0E0',
              height: '6px',
              cornerRadius: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#416743',
                  width: `${projectPct}%`,
                  contents: [],
                },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'sm',
              spacing: 'xs',
              contents:
                projects.length > 0
                  ? projects.map((p) =>
                      taskRow({
                        label: p.name,
                        done: p.dailyPct >= 100,
                        data: new URLSearchParams({ type: 'project', id: p.id }).toString(),
                        lang,
                      }),
                    )
                  : [{ type: 'text', text: t(lang, 'checklistNoProjects'), size: 'sm', color: '#A99A7E' }],
            },
          ],
        },
        ...goalModulesWithTasks.map((mod): messagingApi.FlexBox => {
          const doneCount = mod.dailyTasks.filter((t) => t.done).length
          const pct = Math.round((doneCount / mod.dailyTasks.length) * 100)
          return {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            contents: [
              { type: 'text', text: `🎯 ${mod.title}`, weight: 'bold', size: 'sm', color: '#416743' },
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#E0E0E0',
                height: '6px',
                cornerRadius: 'md',
                contents: [{ type: 'box', layout: 'vertical', backgroundColor: '#416743', width: `${pct}%`, contents: [] }],
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'sm',
                spacing: 'xs',
                contents: mod.dailyTasks.map((t) =>
                  taskRow({
                    label: t.title,
                    done: t.done,
                    data: new URLSearchParams({ type: 'custom_task', id: t.id }).toString(),
                    lang,
                  }),
                ),
              },
            ],
          }
        }),
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: `💻 ${t(lang, 'checklistFrontend')}`,
              weight: 'bold',
              size: 'sm',
              color: '#416743',
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#E0E0E0',
              height: '6px',
              cornerRadius: 'md',
              contents: [
                { type: 'box', layout: 'vertical', backgroundColor: '#416743', width: '60%', contents: [] },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'sm',
              spacing: 'xs',
              contents: [
                taskRow({
                  label: 'React x3 (含 TS)',
                  done: false,
                  data: new URLSearchParams({ type: 'task', title: 'React x3 (含 TS)' }).toString(),
                  lang,
                }),
                taskRow({
                  label: 'Python / 面試題',
                  done: false,
                  data: new URLSearchParams({ type: 'task', title: 'Python / 面試題' }).toString(),
                  lang,
                }),
              ],
            },
          ],
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: `🏃 ${t(lang, 'checklistSport')}`,
              weight: 'bold',
              size: 'sm',
              color: '#416743',
            },
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#E0E0E0',
              height: '6px',
              cornerRadius: 'md',
              contents: [
                { type: 'box', layout: 'vertical', backgroundColor: '#416743', width: '100%', contents: [] },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'sm',
              spacing: 'xs',
              contents: [
                taskRow({
                  label: '超慢跑',
                  done: false,
                  data: new URLSearchParams({ type: 'sport' }).toString(),
                  lang,
                }),
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#416743',
          action: {
            type: 'postback',
            label: t(lang, 'checklistDoneAll'),
            data: new URLSearchParams({ type: 'all_done' }).toString(),
          },
        },
      ],
    },
    styles: {
      body: {
        backgroundColor: '#FFFAF5',
      },
      footer: {
        backgroundColor: '#FFFAF5',
      },
    },
  }
}

function planProgressRow(title: string, pct: number): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'xs',
    margin: 'md',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          { type: 'text', text: title, size: 'sm', flex: 4, wrap: true },
          { type: 'text', text: `${pct}%`, size: 'sm', align: 'end', color: '#416743', flex: 1 },
        ],
      },
      {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#E0E0E0',
        height: '6px',
        cornerRadius: 'md',
        contents: [{ type: 'box', layout: 'vertical', backgroundColor: '#416743', width: `${pct}%`, contents: [] }],
      },
    ],
  }
}

/**
 * 每週匯報，供關鍵字「週報」觸發與排程主動推播（見 services/reminder.ts）共用。
 * 本週打卡次數是「每日任務完成 + 運動紀錄 + 多益每日打卡」三種有實際日期的活動加總，
 * 跟 lib/streak.ts 的連續打卡天數用同一批資料源，只是這裡算的是「次數」不是「連續天數」。
 */
export async function getWeeklyReportFlex(userId: string, lang: BotLang = 'zh'): Promise<messagingApi.FlexBubble> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [dailyTaskCount, sportLogCount, toeicCount, plans] = await Promise.all([
    prisma.dailyTask.count({ where: { userId, completedAt: { gte: weekAgo } } }),
    prisma.sportLog.count({ where: { userId, loggedAt: { gte: weekAgo } } }),
    prisma.toeicProgress.count({ where: { userId, date: { gte: weekAgo } } }),
    prisma.plan.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, take: 5 }),
  ])
  const totalCheckins = dailyTaskCount + sportLogCount + toeicCount

  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        { type: 'text', text: t(lang, 'weeklyTitle'), weight: 'bold', size: 'lg' },
        { type: 'separator', margin: 'md' },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          margin: 'md',
          contents: [
            { type: 'text', text: t(lang, 'weeklyTotalLabel'), size: 'sm', color: '#7C9473' },
            { type: 'text', text: `${totalCheckins} ${t(lang, 'weeklyTotalUnit')}`, weight: 'bold', size: 'xxl', color: '#416743' },
          ],
        },
        { type: 'separator', margin: 'md' },
        { type: 'text', text: t(lang, 'weeklyPlansLabel'), weight: 'bold', size: 'sm', margin: 'md' },
        ...(plans.length > 0
          ? plans.map((p) => planProgressRow(p.title, p.pct))
          : [{ type: 'text' as const, text: t(lang, 'weeklyNoPlans'), size: 'sm' as const, color: '#A99A7E' }]),
      ],
    },
    styles: { body: { backgroundColor: '#FFFAF5' } },
  }
}

function daysSince(dateStr: string): number {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  return Math.max(Math.floor(diffMs / 86_400_000), 0)
}

/**
 * 覆盤分析，供關鍵字「覆盤」觸發（見 routes/lineWebhook.ts，呼叫前會先確認 retro_unlocked，
 * 未解鎖的話由呼叫端回覆提示文字，不會走到這個函式）。內容邏輯對齊網頁「覆盤中心」的
 * goalsDisplay 計算方式（見 src/views/dashboard/RetroView.vue），維持兩邊講的是同一件事。
 */
export async function getRetroAnalysisFlex(userId: string, lang: BotLang = 'zh'): Promise<messagingApi.FlexBubble> {
  const goals = await prisma.retroGoal.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })

  const rows: messagingApi.FlexComponent[] =
    goals.length > 0
      ? goals.map((g) => {
          const elapsedDays = daysSince(g.start)
          const label = g.totalDays ? M.retroPlanned[lang](g.totalDays, elapsedDays + 1) : M.retroOngoing[lang](elapsedDays)
          const pct = g.totalDays ? Math.min(100, Math.round((elapsedDays / g.totalDays) * 100)) : 0
          const box: messagingApi.FlexBox = {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            margin: 'md',
            contents: [
              { type: 'text', text: g.title, size: 'sm', weight: 'bold', wrap: true },
              { type: 'text', text: label, size: 'xs', color: '#A99A7E' },
            ],
          }
          if (g.totalDays) {
            box.contents.push({
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#E0E0E0',
              height: '6px',
              cornerRadius: 'md',
              margin: 'xs',
              contents: [{ type: 'box', layout: 'vertical', backgroundColor: g.color, width: `${pct}%`, contents: [] }],
            })
          }
          return box
        })
      : [
          {
            type: 'text',
            text: t(lang, 'retroEmpty'),
            size: 'sm',
            color: '#A99A7E',
            wrap: true,
          },
        ]

  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [{ type: 'text', text: t(lang, 'retroTitle'), weight: 'bold', size: 'lg' }, { type: 'separator', margin: 'md' }, ...rows],
    },
    styles: { body: { backgroundColor: '#FFFAF5' } },
  }
}
