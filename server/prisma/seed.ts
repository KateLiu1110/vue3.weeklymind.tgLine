import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.plan.deleteMany()
  await prisma.milestone.deleteMany()

  await prisma.plan.createMany({
    data: [
      {
        title: '鐵人三項報名',
        sub: '賽事報名完成',
        pct: 0,
        checkinsDone: 1,
        color: '#ffb21d',
        module: 'sport',
        weekdays: [],
        startTime: '',
        endTime: '',
      },
      {
        title: '多益備考衝刺',
        sub: '週一至週五 07:00–08:00',
        pct: 62,
        checkinsDone: 5,
        color: '#c9a876',
        module: 'toeic',
        weekdays: [0, 1, 2, 3, 4],
        startTime: '07:00',
        endTime: '08:00',
        startDate: '2026-07-01',
        targetDate: '2026-10-01',
      },
      {
        title: '重訓計畫',
        sub: '週一、三、五 19:00–20:00',
        pct: 40,
        checkinsDone: 3,
        color: '#2f6bd8',
        module: 'sport',
        weekdays: [0, 2, 4],
        startTime: '19:00',
        endTime: '20:00',
        startDate: '2026-07-01',
        targetDate: '2026-09-01',
      },
      {
        title: '作品集網站上線',
        sub: '週六整理進度',
        pct: 55,
        checkinsDone: 1,
        color: '#b08968',
        module: 'portfolio',
        weekdays: [5],
        startTime: '',
        endTime: '',
        startDate: '2026-07-01',
        targetDate: '2026-09-15',
      },
    ],
  })

  await prisma.milestone.createMany({
    data: [
      {
        title: '多益 600 分',
        tag: '重點',
        tagBg: '#f0eada',
        tagCol: '#b08968',
        desc: '單字量500達成，克漏字&閱讀測驗持續累積',
        progress: 58,
        color: '#c9a876',
        module: 'toeic',
      },
      {
        title: '作品集初版',
        tag: '進行中',
        tagBg: '#eef3ea',
        tagCol: '#33513f',
        desc: '完成 3 個頁面，尚有台鐵、訂便當專案待開發',
        progress: 42,
        color: '#33513f',
        module: 'portfolio',
      },
    ],
  })
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
