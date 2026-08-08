# WeeklyMind API 架構與產品技術規劃

> 產品定位：**LINE 隨身 AI 助理** —— 了解你的計畫，主動推播進度，讓自律變成習慣。

本文件分兩部分：**現況**（目前程式碼已經有的東西，如實反映）與**規劃**（還沒做、之後要做的部分）。

---

## 一、現況：目前已有的架構

```
src/
├── api/
│   ├── client/
│   │   ├── plans.ts
│   │   ├── milestones.ts
│   │   ├── auth.ts            # fetchMe()（手機驗證碼那兩支已從前端移除，見下方方式三）
│   │   ├── liffAuth.ts        # LIFF QR Code 登入（已建好，登入頁未連結，見下方方式二備註）
│   │   └── dailyTasks.ts      # 臨時待辦事項
│   ├── transport/
│   │   ├── axios.ts           # Axios 實例，自動帶 Authorization: Bearer <JWT>
│   │   └── apiBusinessError.ts
│   └── queryKeys.ts
├── composables/
│   ├── usePlans.ts / useMilestones.ts / useDailyTasks.ts
├── lib/
│   └── authToken.ts           # JWT 存取 localStorage
├── stores/
│   └── auth.ts                # 目前登入使用者 + JWT
├── views/auth/
│   ├── LoginView.vue          # 現在只有一個「使用 LINE 帳號登入」按鈕（RegisterView.vue 已刪除）
│   ├── LineCallbackView.vue   # LINE Login OAuth 授權完成後導回的頁面（/login/line-callback）
│   └── LiffLoginView.vue      # 手機掃 QR Code 後開啟的 LIFF 頁面（保留，登入頁未連結）
└── types/api.ts

server/                         # Express + Prisma + PostgreSQL（Docker 本機開發）
├── src/
│   ├── routes/
│   │   ├── plans.ts / milestones.ts   # 都需要登入，依 userId 過濾
│   │   ├── auth.ts                    # send-code/verify-code（保留但前端未呼叫）+ GET /me
│   │   ├── lineLogin.ts               # LINE Login OAuth（登入頁「使用 LINE 帳號登入」按鈕）
│   │   ├── liffAuth.ts                # LIFF QR Code 登入 session（保留，登入頁未連結）
│   │   ├── lineWebhook.ts             # LINE Messaging API webhook
│   │   └── dailyTasks.ts              # 臨時待辦事項 CRUD
│   ├── services/
│   │   ├── line.ts            # LINE reply/push + Flex Message 組裝（每日任務卡）
│   │   ├── ai.ts               # 規則式意圖判斷（之後要換 Claude API 的地方）
│   │   ├── linkClassifier.ts   # 連結平台判斷（ig/threads/fb/other）
│   │   └── reminder.ts         # node-cron 每日推播排程
│   ├── middleware/auth.ts      # 解析 JWT，掛在需要登入的路由上
│   └── lib/jwt.ts
└── prisma/schema.prisma
```

**這份文件先前的版本寫的 `checkIn.ts`/`schedule.ts`/`review.ts`/`billing.ts` 從未真的存在**，是最早期規劃階段的占位想法，已從文件移除，避免跟實際檔案對不上。

---

## 二、資料庫

**本機開發**：PostgreSQL 跑在 Docker（見專案根目錄 `docker-compose.yml`），`docker compose up -d` 啟動。連線字串在 `server/.env` 的 `DATABASE_URL`。

> 本機常見雷：這台機器上可能同時有原生安裝的 PostgreSQL 服務佔用 5432/5433 等常見 port，`docker-compose.yml` 目前把 container 對外開在 **5434**，換一台機器測試前，先確認這個 port 沒被佔用（`docker compose ps` 確認 container 真的是 `Up` 狀態，不是被別的服務擋住）。

Schema（`server/prisma/schema.prisma`）：

- `User` — `phone`、`lineUserId`（皆可為 null，兩種登入方式共用同一張表）
- `Plan` / `Milestone` — 都有 `userId` 外鍵，每個帳號的資料互相隔離
- `LinkRule` / `SavedLink` — LINE 傳連結時的自動歸類規則與收藏紀錄
- `SportLog` — LINE 傳「跑了5公里」之類訊息時的運動打卡
- `ToeicProgress` — 多益每日打卡（一個帳號一天一筆）
- `Project` — 作品集看板專案（LINE 打卡用；跟前端目前 `portfolio.ts` store 的看板資料是兩個獨立來源，還沒整合）
- `DailyTask` — 一般學習/生活打卡紀錄，也是「臨時待辦事項」功能的資料表

正式上線：把 `DATABASE_URL` 換成雲端 Postgres（Supabase/Railway）連線字串即可，schema 不用改（已經是 `provider = "postgresql"`）。

---

## 三、登入

登入頁現在**只有 LINE 一種入口**（方式二）；方式一是 LINE 官方帳號加好友時自動觸發，不用畫面。方式三（手機驗證碼）的後端 API 還在，但前端已經拿掉，純粹備用。

### 方式一：LINE 加好友即完成註冊＋登入 ✅

```
用戶在 LINE 加 WeeklyMind 為好友
        │  LINE 平台觸發 follow event → POST /api/line/webhook
        ▼
server/src/routes/lineWebhook.ts 的 resolveUserId()
        │  upsert User { lineUserId }（帳號不存在就建立，存在就直接用）
        ▼
回覆歡迎訊息，帳號已經可以使用（傳訊息記錄運動/多益/連結都會歸到這個帳號）
```

簽章驗證用 `@line/bot-sdk` 的 `line.middleware()`，這個 router **必須掛在 `express.json()` 之前**（`server/src/index.ts`），否則 body 會被提前解析、簽章驗證會失敗。

### 方式二：LINE Login 登入後台網站 ✅（架構完成，尚未申請 LINE Login Channel）

一般網站常見的「使用 LINE 帳號登入」——不是掃 QR Code，是整頁導向 LINE 官方授權頁面，授權完自動導回並登入：

```
使用者點登入頁「使用 LINE 帳號登入」
        │  window.location.href = GET /api/auth/line/login
        ▼
server/src/routes/lineLogin.ts 產生 CSRF state → 302 導向
https://access.line.me/oauth2/v2.1/authorize?...&redirect_uri=.../api/auth/line/callback
        │  使用者在 LINE 網站/App 內同意授權
        ▼
LINE 導回 GET /api/auth/line/callback?code=...&state=...
        │  核對 state → 用 code 換 access_token → 打 LINE profile API 拿 userId/displayName/頭像
        │  upsert User { lineUserId } → 產生 JWT
        ▼
302 導回前端 /login/line-callback?token=<JWT>
        │  LineCallbackView.vue 存 token → GET /api/auth/me 補拿 user 資料 → 進後台
```

**目前 `LINE_LOGIN_CHANNEL_ID`/`LINE_LOGIN_CHANNEL_SECRET` 是空的**（還沒在 LINE Developers Console 建立 LINE Login Channel——這跟方式一用的 Messaging API Channel 是不同類型，要另外申請），按鈕按下去會直接被導回登入頁並顯示「LINE 登入尚未設定」。要啟用只需要：
1. 在 LINE Developers Console 建立 **LINE Login** Channel（不是 Messaging API），Callback URL 填 `server/.env` 的 `LINE_LOGIN_REDIRECT_URI`（預設 `http://localhost:4000/api/auth/line/callback`）——LINE Login **支援 http://localhost**，不像 LIFF 一定要 https，本機就能測到底
2. 把 Channel ID/Secret 填進 `server/.env` 的 `LINE_LOGIN_CHANNEL_ID`/`LINE_LOGIN_CHANNEL_SECRET`

> **LIFF 掃 QR Code 登入**（`server/src/routes/liffAuth.ts`、`/liff/login` 頁面）架構也還在，只是登入頁沒有連結進去了——那個模式比較適合「手機已經在 LINE 裡跟 Bot 互動，想連動登入桌面網頁」的情境，跟一般網站「使用 LINE 帳號登入」是不同的使用情境，先保留程式碼備用。

### 方式三：手機號碼＋驗證碼（後端保留，前端已移除）

原本是給還沒加 LINE 好友、想先體驗 demo 的人用，`server/src/routes/auth.ts` 的 `send-code`/`verify-code` 都還在（驗證碼沒接真實簡訊商，只是印在後端 console），但登入頁跟註冊頁都已經拿掉了，改成只用 LINE 登入。示範帳號（`0912-345-678`）的種子資料因此暫時沒有畫面入口，見 [LOGIN_操作手冊.md](LOGIN_操作手冊.md)。

---

## 四、LINE Bot 訊息處理 ✅

`server/src/routes/lineWebhook.ts` 依訊息內容分派：

| 使用者說 | 判斷方式（`services/ai.ts`，規則式，非 AI） | 動作 |
| --- | --- | --- |
| 貼一個網址 | URL 格式判斷 | 依 `LinkRule` 自動歸類，存進 `SavedLink`，回傳 Flex 卡片確認分類 |
| 「跑了5公里」 | 關鍵字 + 抽取數字 | 存進 `SportLog`，回報本週累計公里數 |
| 「背了20個單字」「閱讀測驗」等 | 關鍵字 | upsert 當天 `ToeicProgress` |
| 「學了 Vue」「看了 React」等 | 關鍵字 | 存進 `DailyTask` |
| 「任務」 | 精確比對 | 回傳當天的每日任務 CheckList（Flex Message，即時讀 `ToeicProgress`/`Project`） |
| 其他文字 | fallback | 隨機回覆聊天訊息 |

`services/ai.ts` 的 `detectIntent()` 目前是規則式（正規表示式關鍵字比對），**尚未接 Claude API**——這是刻意的：先把「訊息 → 結構化資料 → 存 DB → 回覆」整條路徑打通，之後只要把 `detectIntent()` 的實作換成呼叫 Claude API，呼叫端（webhook）完全不用改，因為回傳的 `Intent` 型別已經是 provider-agnostic 的設計。

---

## 五、臨時待辦事項 ✅

計畫性任務（`Plan`，固定排程）與臨時待辦（`DailyTask`，隨時新增）分開管理：

- **從 LINE 新增**：傳一般學習/生活類的訊息（見上表），會直接進 `DailyTask`，`source: 'line'`，且直接標記為已完成（LINE 端的語意是「回報已完成」，不是「提醒我做」）
- **從網頁新增**：計畫管理頁最下方「臨時待辦事項」區塊，手動輸入 → `POST /api/daily-tasks`，`source: 'web'`，預設未完成，可以點擊打勾／刪除

## 六、推播排程 ✅（cron 已啟動，尚未有真實 LINE 好友可推）

`server/src/services/reminder.ts` 用 `node-cron`，預設每天 08:00（`server/.env` 的 `DAILY_CHECKIN_CRON`/`DAILY_CHECKIN_TIMEZONE` 可調），對所有 `lineUserId` 不為空的使用者推播每日任務 CheckList。目前規劃裡的「21:00 完成率摘要／週一規劃／週五回顧／月總結」還沒實作，只有每日任務卡這一種推播。

---

## 七、解鎖機制（規劃中，尚未實作）

取代原本「收藏網址」的構想，改成**完成特定行為解鎖功能**：

| 觸發行為 | 解鎖項目 |
| --- | --- |
| 連續打卡 7 天 | 進階報表（覆盤中心的長期趨勢圖） |
| 新增第一個計畫 | 執行中心 |
| 綁定 LINE 帳號 | 每日/每週推播提醒 |

需要新增 `Achievement` model（`userId`、`key`、`unlockedAt`）與對應的判斷邏輯，目前 schema 還沒加這張表。

---

## 八、部署架構（規劃中，目前只有本機開發環境）

```
用戶（LINE / 後台網站）
        │
        ▼
Vercel（前端，Vue 靜態站）
        │  呼叫 API
        ▼
Railway（後端 Node.js + Express）
        │  Prisma
        ▼
Supabase 或 Railway 附掛的 PostgreSQL
```

| 服務 | 免費額度 | 付費 |
| --- | --- | --- |
| Railway（後端） | $5/月免費額度 | 用多少付多少 |
| Supabase（資料庫） | 500MB 免費 | $25/月起 |
| Vercel（前端） | 完全免費 | — |

1,000 個用戶以內，免費額度大致夠用。上線前需要：`DATABASE_URL` 換成雲端連線字串、`JWT_SECRET` 換成真的隨機密鑰、`LINE_LOGIN_REDIRECT_URI`/`FRONTEND_ORIGIN` 換成正式網域（LINE Login callback URL 要跟 Console 設定的一致）、LIFF（如果之後要接回登入頁）需要 https 網域才能運作。

---

## 九、還沒做的部分（依需不需要外部憑證排序）

1. **Claude API 待辦解析**（需要 Claude API Key）：把 `services/ai.ts` 的 `detectIntent()` 從規則式換成真的呼叫 Claude API。
2. **解鎖機制**（不需外部憑證，隨時可做）：新增 `Achievement` model + 判斷邏輯。
3. **21:00/週報/月報推播**（不需外部憑證）：`reminder.ts` 目前只有每日任務卡一種排程，其餘規劃的推播時段還沒實作。
4. **LINE Login 實際啟用**（需要 LINE Developers Console 建立 LINE Login Channel）：架構已完成，只差申請與環境變數，本機可測（支援 http://localhost）。
5. **LIFF 實際啟用 + 接回登入頁**（需要 LINE Developers Console 建立 LIFF App + https 網域）：架構已完成，目前登入頁沒有入口，之後若要支援「手機 LINE 內連動登入」再接回去。
6. **正式部署**（需要 Railway/Supabase/Vercel 帳號）：本機到雲端的落差主要是連線字串與網域。
