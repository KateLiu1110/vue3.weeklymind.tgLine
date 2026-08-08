import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.js'
import { dailyTasksRouter } from './routes/dailyTasks.js'
import { liffAuthRouter } from './routes/liffAuth.js'
import { lineLoginRouter } from './routes/lineLogin.js'
import { lineWebhookRouter } from './routes/lineWebhook.js'
import { milestonesRouter } from './routes/milestones.js'
import { plansRouter } from './routes/plans.js'
import { startDailyCheckinReminder } from './services/reminder.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(cors())

// LINE 的 line.middleware() 自己會處理原始 request body 來驗證簽章，
// 一定要掛在全域 express.json() 之前，否則 body 會被提前解析掉。
app.use('/api/line/webhook', lineWebhookRouter)

app.use(express.json())

app.use('/api/plans', plansRouter)
app.use('/api/milestones', milestonesRouter)
app.use('/api/auth', authRouter)
app.use('/api/auth/line', lineLoginRouter)
app.use('/api/liff', liffAuthRouter)
app.use('/api/daily-tasks', dailyTasksRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`WeeklyMind API listening on http://localhost:${port}`)
})

startDailyCheckinReminder()
