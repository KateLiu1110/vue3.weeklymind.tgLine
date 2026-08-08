import { messagingApi } from '@line/bot-sdk'
import type { LinkPlatform } from '@prisma/client'
import { prisma } from '../db.js'

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

function taskRow(params: { label: string; done: boolean; data: string }): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'baseline',
    paddingAll: 'sm',
    backgroundColor: '#F5EFE6',
    cornerRadius: 'md',
    contents: [{ type: 'text', text: `${params.done ? '●' : '○'} ${params.label}`, size: 'sm' }],
    action: { type: 'postback', data: params.data },
  }
}

/**
 * 每日打卡 CheckList，供關鍵字觸發（見 routes/lineWebhook.ts）
 * 與排程主動推播（見 services/reminder.ts）共用。
 * TOEIC 與作品集區塊會即時反映該使用者當天的真實資料。
 */
export async function getCheckListFlex(userId: string): Promise<messagingApi.FlexBubble> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [toeic, projects] = await Promise.all([
    prisma.toeicProgress.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.project.findMany({
      where: { userId, status: 'doing' },
      orderBy: { createdAt: 'asc' },
      take: 2,
    }),
  ])

  const vocabDone = toeic?.vocabDone ?? false
  const readingDone = toeic?.readingDone ?? false
  const toeicPct = Math.round((((vocabDone ? 1 : 0) + (readingDone ? 1 : 0)) / 2) * 100)
  const projectPct = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.dailyPct, 0) / projects.length)
    : 0

  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: '📝 每日任務 CheckList',
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
              text: '📚 TOEIC 衝刺',
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
                }),
                taskRow({
                  label: 'TOEIC 閱讀測驗',
                  done: readingDone,
                  data: new URLSearchParams({ type: 'toeic', field: 'reading' }).toString(),
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
              text: '🎨 作品集規劃',
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
                      }),
                    )
                  : [{ type: 'text', text: '尚無進行中的專案', size: 'sm', color: '#A99A7E' }],
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
              text: '💻 前端小知識',
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
                }),
                taskRow({
                  label: 'Python / 面試題',
                  done: false,
                  data: new URLSearchParams({ type: 'task', title: 'Python / 面試題' }).toString(),
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
              text: '🏃 運動',
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
            label: '一鍵完成所有項目',
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
