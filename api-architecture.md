# WeeklyMind API 架構

## 資料夾結構

```
src/
├── api/
│   ├── client/
│   │   ├── plans.ts          # 計畫 API
│   │   ├── checkIn.ts        # 打卡 API
│   │   ├── schedule.ts       # 行程提醒 API
│   │   ├── review.ts         # 覆盤 API
│   │   ├── user.ts           # 用戶 / 設定 API
│   │   ├── billing.ts        # 訂閱 / 付費 API
│   │   └── lineBot.ts        # LINE Bot 設定 API
│   ├── transport/
│   │   ├── axios.ts          # Axios 實例 + Interceptor
│   │   └── apiBusinessError.ts
│   └── queryKeys.ts          # 所有 Query Key
├── composables/
│   ├── usePlans.ts
│   ├── useCheckIn.ts
│   ├── useSchedule.ts
│   ├── useReview.ts
│   └── useUser.ts
├── types/
│   └── api.ts                # Response Envelope + DTO 型別
└── plugins/
    └── queryClient.ts        # TanStack QueryClient 設定
```
