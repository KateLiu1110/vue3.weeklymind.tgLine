import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { milestonesRouter } from './routes/milestones.js'
import { plansRouter } from './routes/plans.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(cors())
app.use(express.json())

app.use('/api/plans', plansRouter)
app.use('/api/milestones', milestonesRouter)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`WeeklyMind API listening on http://localhost:${port}`)
})
