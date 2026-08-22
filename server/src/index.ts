import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { achievementsRouter } from './routes/achievements.js'
import { authRouter } from './routes/auth.js'
import { cronRouter } from './routes/cron.js'
import { customModulesRouter } from './routes/customModules.js'
import { dailyTasksRouter } from './routes/dailyTasks.js'
import { liffAuthRouter } from './routes/liffAuth.js'
import { lineLoginRouter } from './routes/lineLogin.js'
import { lineWebhookRouter } from './routes/lineWebhook.js'
import { linksRouter } from './routes/links.js'
import { milestonesRouter } from './routes/milestones.js'
import { overviewRouter } from './routes/overview.js'
import { plansRouter } from './routes/plans.js'
import { portfolioRouter } from './routes/portfolio.js'
import { retroRouter } from './routes/retro.js'
import { sportRouter } from './routes/sport.js'
import { streakRouter } from './routes/streak.js'
import { toeicRouter } from './routes/toeic.js'
import { startDailyCheckinReminder, startWeeklyReportReminder } from './services/reminder.js'

const app = express()
const port = Number(process.env.PORT || 8080)

app.use(cors())

// LINE 的 line.middleware() 自己會處理原始 request body 來驗證簽章，
// 一定要掛在全域 express.json() 之前，否則 body 會被提前解析掉。
app.use('/api/line/webhook', lineWebhookRouter)

app.use(express.json())

app.use('/api/plans', plansRouter)
app.use('/api/milestones', milestonesRouter)
app.use('/api/auth', authRouter)
app.use('/api/auth/line', lineLoginRouter)
app.use('/api/cron', cronRouter)
app.use('/api/liff', liffAuthRouter)
app.use('/api/daily-tasks', dailyTasksRouter)
app.use('/api/toeic', toeicRouter)
app.use('/api/sport', sportRouter)
app.use('/api/portfolio', portfolioRouter)
app.use('/api/links', linksRouter)
app.use('/api/retro', retroRouter)
app.use('/api/achievements', achievementsRouter)
app.use('/api/overview', overviewRouter)
app.use('/api/streak', streakRouter)
app.use('/api/custom-modules', customModulesRouter)

app.use(errorHandler)

app.listen(port, '0.0.0.0', () => {
  console.log(`WeeklyMind API listening on http://0.0.0.0:${port}`)
})

startDailyCheckinReminder()
startWeeklyReportReminder()
