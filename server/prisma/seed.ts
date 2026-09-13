import { PrismaClient } from '@prisma/client'
import { seedDemoContentFor as fillDemoContentFor } from '../src/lib/demoContent.js'

const prisma = new PrismaClient()

// Keep in sync with DEMO_ACCOUNT_PHONE in src/stores/core.ts.
const DEMO_ACCOUNT_PHONE = '0912-345-678'

// 登入頁已拿掉手機驗證碼入口，示範帳號沒有畫面可以登進去了。開發時實際用來看畫面的
// 是這個真實 LINE 帳號（凱特本人），所以種子資料改成同時灌到這裡；重跑 seed 只會重置
// 這份示範內容涵蓋的欄位（plan/milestone/schedule/focusTask + goalTitle），不會動到
// 她之後在網頁上自己新增的其他資料。
const DEV_LINE_USER_ID = 'Uf7dd293205c24fd46a00cc153e1e3c27'

async function seedDemoContentFor(userId: string) {
  // 重跑 seed 只重置這份示範內容涵蓋的資料表，不會動到使用者之後自己新增的其他資料。
  await prisma.plan.deleteMany({ where: { userId } })
  await prisma.milestone.deleteMany({ where: { userId } })
  await prisma.schedule.deleteMany({ where: { userId } })
  await prisma.focusTask.deleteMany({ where: { userId } })
  await prisma.toeicExamDate.deleteMany({ where: { userId } })
  await prisma.toeicTaskItem.deleteMany({ where: { userId } })
  await prisma.project.deleteMany({ where: { userId } })
  await prisma.savedLink.deleteMany({ where: { userId } })
  await prisma.retroGoal.deleteMany({ where: { userId } })

  await fillDemoContentFor(userId)
}

async function main() {
  // 只重置這兩個示範帳號自己的資料——絕對不能動到其他真實使用者的 plan/milestone。
  const demoUser = await prisma.user.upsert({
    where: { phone: DEMO_ACCOUNT_PHONE },
    update: {},
    create: { phone: DEMO_ACCOUNT_PHONE, displayName: '示範帳號' },
  })
  await seedDemoContentFor(demoUser.id)

  const devUser = await prisma.user.findUnique({ where: { lineUserId: DEV_LINE_USER_ID } })
  if (devUser) await seedDemoContentFor(devUser.id)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
