import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))

await page.goto('http://localhost:5173/app/overview')
await page.waitForTimeout(1000)

await page.click('text=新增計畫')
await page.waitForTimeout(300)
const modal = page.locator('.fixed.inset-0')
const titleInput = modal.locator('label:has-text("計畫名稱")').locator('xpath=following-sibling::input[1]')
await titleInput.fill('沒接後端測試')
await modal.getByText('新增', { exact: true }).click()
await page.waitForTimeout(1500)

console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors, null, 2))
await page.screenshot({
  path: 'C:/Users/user/AppData/Local/Temp/claude/d---Kate--project-portfolio--react-vue3-weeklymind-tgLine/b66d4595-a35e-45ae-a421-9a5bac43e7a6/scratchpad/no_backend_test.png',
  fullPage: true,
})

await browser.close()
