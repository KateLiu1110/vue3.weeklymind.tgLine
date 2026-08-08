import type { LinkPlatform } from '@prisma/client'

export function detectPlatform(url: string): LinkPlatform {
  if (/instagram\.com/i.test(url)) return 'ig'
  if (/threads\.net/i.test(url)) return 'threads'
  if (/facebook\.com|fb\.watch/i.test(url)) return 'fb'
  return 'other'
}
