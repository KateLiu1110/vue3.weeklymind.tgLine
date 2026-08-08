import type { SportCategory } from '@prisma/client'

/**
 * Rule-based intent detection standing in for a real NLU/LLM call.
 * Swap the body of `detectIntent` for a Claude API call once real semantic
 * understanding is needed — the intent shape below is deliberately
 * provider-agnostic so that swap doesn't ripple into callers.
 */
export type Intent =
  | { type: 'url' }
  | { type: 'sport'; category: SportCategory; distanceKm?: number }
  | {
      type: 'toeic'
      vocabDone?: boolean
      readingDone?: boolean
      clozeDone?: boolean
      dialogueDone?: boolean
    }
  | { type: 'learning'; category: string }
  | { type: 'chat' }

function isLikelyUrl(text: string): boolean {
  const trimmed = text.trim()
  if (/\s/.test(trimmed)) return false
  return /^https?:\/\//i.test(trimmed) || /\.(com|net|org|io|dev|co)\b/i.test(trimmed)
}

function extractDistanceKm(text: string): number | undefined {
  const match = text.match(/([\d.]+)\s*(?:km|公里)/i)
  return match?.[1] ? Number(match[1]) : undefined
}

export function detectIntent(text: string): Intent {
  if (isLikelyUrl(text)) return { type: 'url' }

  const vocabDone = /(背了|背熱|單字)/.test(text)
  const readingDone = /閱讀測驗|閱讀/.test(text)
  const clozeDone = /克漏字/.test(text)
  const dialogueDone = /對話/.test(text)
  if (vocabDone || readingDone || clozeDone || dialogueDone) {
    return { type: 'toeic', vocabDone, readingDone, clozeDone, dialogueDone }
  }

  if (/(跑了|慢跑|km|公里)/i.test(text)) {
    return { type: 'sport', category: 'run', distanceKm: extractDistanceKm(text) }
  }
  if (/(健身|重訓|深蹲|硬舉|臥推|引體向上|划船|肩推|胸推)/.test(text)) {
    return { type: 'sport', category: 'gym' }
  }
  if (/(瑜珈|伸展|冥想)/.test(text)) {
    return { type: 'sport', category: 'yoga' }
  }

  if (/(學了|學習|讀了|看了|前端|Vue|React|TypeScript)/i.test(text)) {
    return { type: 'learning', category: '前端知識' }
  }

  return { type: 'chat' }
}

const CHAT_FALLBACKS = [
  '收到！有什麼想記錄的都可以直接跟我說 🐾（試試：「今天跑了5公里」、「背了3個單字」，或直接貼一個連結）',
  '嗨主人 👋 打卡、貼連結、或聊聊今天的進度都可以喔！',
]

export function pickChatReply(): string {
  return CHAT_FALLBACKS[Math.floor(Math.random() * CHAT_FALLBACKS.length)] as string
}
