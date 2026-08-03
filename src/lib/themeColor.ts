/**
 * Chart.js draws on a <canvas>, so it can't consume Tailwind utility classes —
 * it needs real color strings. Rather than duplicating hex values from
 * theme.css, read the token straight off :root at call time so the chart
 * palette always tracks the design tokens.
 */
export function themeColor(token: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim()
  return value || '#000000'
}
