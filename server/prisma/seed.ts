import { Prisma, PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import { checkAndUnlockAchievements } from '../src/lib/achievements.js'

const prisma = new PrismaClient()

// Keep in sync with DEMO_ACCOUNT_PHONE in src/stores/core.ts.
const DEMO_ACCOUNT_PHONE = '0912-345-678'

// 登入頁已拿掉手機驗證碼入口，示範帳號沒有畫面可以登進去了。開發時實際用來看畫面的
// 是這個真實 LINE 帳號（凱特本人），所以種子資料改成同時灌到這裡；重跑 seed 只會重置
// 這份示範內容涵蓋的欄位（plan/milestone/schedule/focusTask + goalTitle），不會動到
// 她之後在網頁上自己新增的其他資料。
const DEV_LINE_USER_ID = 'Uf7dd293205c24fd46a00cc153e1e3c27'

async function seedDemoContentFor(userId: string) {
  await prisma.plan.deleteMany({ where: { userId } })
  await prisma.milestone.deleteMany({ where: { userId } })
  await prisma.schedule.deleteMany({ where: { userId } })
  await prisma.focusTask.deleteMany({ where: { userId } })

  await prisma.user.update({ where: { id: userId }, data: { goalTitle: '我要去海外工作' } })

  await prisma.plan.createMany({
    data: [
      {
        userId,
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
        userId,
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
        userId,
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
        userId,
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
        userId,
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
        userId,
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

  await prisma.schedule.createMany({
    data: [
      { userId, day: '15', title: '多益公開測驗報名截止', reminded: false },
      { userId, day: '22', title: '作品集里程碑檢查', reminded: true },
    ],
  })

  await prisma.focusTask.createMany({
    data: [
      {
        userId,
        title: '背熟 200 個常用單字',
        module: 'toeic',
        moduleLabel: '多益英文',
        tagBg: 'bg-cream-175',
        tagCol: 'text-clay-500',
        progress: 60,
        due: '2026-07-21',
      },
      {
        userId,
        title: '繪製台鐵流程線稿圖',
        module: 'portfolio',
        moduleLabel: '作品集',
        tagBg: 'bg-cream-175',
        tagCol: 'text-clay-500',
        progress: 25,
        due: '2026-07-22',
      },
    ],
  })

  await prisma.toeicExamDate.deleteMany({ where: { userId } })
  await prisma.toeicTaskItem.deleteMany({ where: { userId } })
  await prisma.project.deleteMany({ where: { userId } })

  await prisma.toeicProfile.upsert({
    where: { userId },
    update: {
      goalTitle: '多益目標 600 分',
      goalDesc: '每日車上1小時:背單字、閱讀測驗、克漏字、英文課本、每日對話。每週固定晚上英文課。',
      classSchedule: '每週三 19:00 英文課',
      lastMockScore: 450,
      targetScore: 600,
      scoreTrend: [
        { label: '3月模擬', h: 340, highlight: false },
        { label: '4月模擬', h: 380, highlight: false },
        { label: '5月模擬', h: 410, highlight: false },
        { label: '6月模擬', h: 450, highlight: true },
      ] as unknown as Prisma.InputJsonValue,
    },
    create: {
      userId,
      goalTitle: '多益目標 600 分',
      goalDesc: '每日車上1小時:背單字、閱讀測驗、克漏字、英文課本、每日對話。每週固定晚上英文課。',
      classSchedule: '每週三 19:00 英文課',
      lastMockScore: 450,
      targetScore: 600,
      scoreTrend: [
        { label: '3月模擬', h: 340, highlight: false },
        { label: '4月模擬', h: 380, highlight: false },
        { label: '5月模擬', h: 410, highlight: false },
        { label: '6月模擬', h: 450, highlight: true },
      ] as unknown as Prisma.InputJsonValue,
    },
  })

  await prisma.toeicExamDate.createMany({
    data: [
      { userId, title: '多益公開測驗', date: '2025-09-14' },
      { userId, title: '第 2 次模擬考', date: '2025-08-20' },
    ],
  })

  await prisma.toeicTaskItem.createMany({
    data: [
      { userId, title: '背單字', iconKey: 'vocab', todayLabel: '今日 20 / 20 個', pct: 100, done: true },
      { userId, title: '閱讀測驗', iconKey: 'book', todayLabel: '今日 1 / 1 篇', pct: 100, done: true },
      { userId, title: '克漏字', iconKey: 'award', todayLabel: '今日 0 / 1 篇', pct: 0, done: false },
      { userId, title: '英文課本', iconKey: 'toeic', todayLabel: 'Unit 8・完成 60%', pct: 60, done: false },
      { userId, title: '每日對話', iconKey: 'chat', todayLabel: '今日 0 / 1 段', pct: 0, done: false },
    ],
  })

  await prisma.project.createMany({
    data: [
      { userId, name: '台鐵', caption: '預計 2026-07-20 完成', status: 'todo' },
      { userId, name: '保險', caption: '預計 2026-07-25 完成', status: 'todo' },
      { userId, name: '訂便當', caption: '每日訂餐小工具・30% 完成', status: 'doing', dailyPct: 30 },
      { userId, name: '自有網站', caption: '個人網站首頁 + 專案頁・55% 完成', status: 'doing', dailyPct: 55 },
      { userId, name: '英文自我介紹', caption: '面試用 30 秒自介腳本・80% 完成', status: 'doing', dailyPct: 80 },
      { userId, name: '前端知識', caption: 'React / Vue 筆記整理', status: 'done', dailyPct: 100 },
    ],
  })

  await prisma.savedLink.deleteMany({ where: { userId } })
  await prisma.retroGoal.deleteMany({ where: { userId } })

  await prisma.savedLink.createMany({
    data: [
      { userId, title: '極簡作品集排版參考', url: 'instagram.com/p/portfolio-ref-01', category: '設計靈感', platform: 'ig' },
      { userId, title: '個人品牌配色案例', url: 'instagram.com/p/brand-color-02', category: '設計靈感', platform: 'ig' },
      { userId, title: 'React 效能優化心得串', url: 'threads.net/@dev/post/perf-tips', category: '前端知識', platform: 'threads' },
      { userId, title: 'TypeScript 型別技巧整理', url: 'threads.net/@dev/post/ts-tips', category: '前端知識', platform: 'threads' },
      { userId, title: '前端社群求職心得分享', url: 'facebook.com/groups/fe/posts/123', category: '生活雜記', platform: 'fb' },
    ],
  })

  // 「目前第 X 天」是相對「今天」算出來的，用 dayjs 反推開始日期，seed 不管哪天重跑
  // 都會呈現一樣的天數。
  const today = dayjs()
  await prisma.retroGoal.createMany({
    data: [
      { userId, title: '多益 600 分', start: today.subtract(70, 'day').format('YYYY-MM-DD'), totalDays: 90, color: '#c9a876' },
      { userId, title: '作品集初版', start: today.subtract(43, 'day').format('YYYY-MM-DD'), totalDays: 60, color: '#33513f' },
      { userId, title: '前端知識累積', start: today.subtract(51, 'day').format('YYYY-MM-DD'), totalDays: null, color: '#2f6bd8' },
    ],
  })

  // 示範內容本來就有計畫跟打卡次數，直接補跑一次解鎖判斷，讓「連結收藏」「覆盤中心」
  // 呈現應有的已解鎖狀態，不用另外手動打卡才能看到完整畫面。
  await checkAndUnlockAchievements(userId)
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
