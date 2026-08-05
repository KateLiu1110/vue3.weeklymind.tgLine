import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:5193/app/overview')
await page.waitForTimeout(800)
await page.reload()
await page.waitForTimeout(800)
await page.screenshot({
  path: 'C:/Users/user/AppData/Local/Temp/claude/d---Kate--project-portfolio--react-vue3-weeklymind-tgLine/b66d4595-a35e-45ae-a421-9a5bac43e7a6/scratchpad/pie_fixed.png',
  clip: { x: 260, y: 90, width: 1000, height: 330 },
})
await browser.close()
