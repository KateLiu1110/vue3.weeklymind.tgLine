# WeeklyMind API 架構與產品技術規劃

> 產品定位：**LINE 隨身 AI 助理** —— 了解你的計畫，主動推播進度，讓自律變成習慣。

本文件分兩部分：**現況**（目前程式碼已經有的東西，如實反映）與**規劃**（還沒做、之後要做的部分）。

---

## 一、現況：目前已有的架構

```
src/
├── api/
│   ├── client/
│   │   ├── plans.ts / milestones.ts / dailyTasks.ts
│   │   ├── toeic.ts / sport.ts / portfolio.ts / links.ts / retro.ts
│   │   ├── achievements.ts    # 解鎖狀態查詢
│   │   ├── auth.ts            # fetchMe()（手機驗證碼那兩支已從前端移除，見下方方式三）
│   │   └── liffAuth.ts        # LIFF QR Code 登入（已建好，登入頁未連結，見下方方式二備註）
│   ├── transport/
│   │   ├── axios.ts           # Axios 實例，自動帶 Authorization: Bearer <JWT>
│   │   └── apiBusinessError.ts
│   └── queryKeys.ts
├── composables/               # 每個資源一組 use<X>()（查詢）+ use<X>Mutations()（新增/刪除）
│   ├── usePlans.ts / useMilestones.ts / useDailyTasks.ts
│   ├── useToeic.ts / useSport.ts / usePortfolioBoard.ts / useLinks.ts / useRetro.ts
│   └── useAchievements.ts
├── lib/
│   └── authToken.ts           # JWT 存取 localStorage
├── stores/
│   ├── auth.ts                 # 登入使用者 + JWT + 訪客動作守門員（requireLogin）
│   ├── core.ts                  # 計畫/里程碑/自訂模組 + 各 Modal 的 UI 狀態
│   └── toeic.ts / sport.ts / portfolio.ts / links.ts / retro.ts
│       # 這 5 個 store 現在只留 Modal/表單的 UI 狀態，資料本體改由對應 composable 提供
│       # （Pinia＝UI 狀態、TanStack Query＝伺服器狀態，回歸最初的架構分工）
├── components/common/
│   └── LockedFeature.vue      # 「連結收藏」「覆盤中心」未解鎖時顯示的鎖定畫面
├── views/auth/
│   ├── LoginView.vue          # 只有一個「使用 LINE 帳號登入」按鈕（RegisterView.vue 已刪除）
│   ├── LineCallbackView.vue   # LINE Login OAuth 授權完成後導回的頁面（/login/line-callback）
│   └── LiffLoginView.vue      # 手機掃 QR Code 後開啟的 LIFF 頁面（保留，登入頁未連結）
└── types/api.ts

server/                         # Express + Prisma + PostgreSQL（Docker 本機開發）
├── src/
│   ├── routes/
│   │   ├── plans.ts / milestones.ts / dailyTasks.ts   # 都需要登入，依 userId 過濾
│   │   ├── toeic.ts / sport.ts / portfolio.ts          # 同上
│   │   ├── links.ts / retro.ts                          # 需要登入 + 已解鎖（requireUnlocked）
│   │   ├── achievements.ts                              # GET 目前已解鎖的項目
│   │   ├── auth.ts                    # send-code/verify-code（保留但前端未呼叫）+ GET /me
│   │   ├── lineLogin.ts               # LINE Login OAuth（登入頁「使用 LINE 帳號登入」按鈕）
│   │   ├── liffAuth.ts                # LIFF QR Code 登入 session（保留，登入頁未連結）
│   │   └── lineWebhook.ts             # LINE Messaging API webhook
│   ├── services/
│   │   ├── line.ts            # LINE reply/push + Flex Message 組裝（每日任務卡）
│   │   ├── ai.ts               # 規則式意圖判斷（之後要換 Claude API 的地方）
│   │   ├── linkClassifier.ts   # 連結平台判斷（ig/threads/fb/other）
│   │   └── reminder.ts         # node-cron 每日推播排程
│   ├── middleware/auth.ts      # requireAuth（解析 JWT）+ requireUnlocked（解鎖檢查）
│   └── lib/
│       ├── jwt.ts
│       └── achievements.ts     # 解鎖條件判斷（見下方§七）
└── prisma/schema.prisma
```

**這份文件先前的版本寫的 `checkIn.ts`/`schedule.ts`/`review.ts`/`billing.ts` 從未真的存在**，是最早期規劃階段的占位想法，已從文件移除，避免跟實際檔案對不上。

---

## 二、功能狀態矩陣（正向 / 反向 / 初始狀態）

以下為目前實際上線狀態，不再包含已移除的草稿功能。每個功能都標示：
- 正向流程：實際會怎麼走
- 反向流程：失敗/鎖定/未設定時的行為
- 初始狀態：沒有資料時的預設行為

| 功能 | 正向流程 | 反向流程 | 初始狀態 |
| --- | --- | --- | --- |
| LINE 加好友自動註冊 | 使用者加好友 → webhook `follow` → `upsert User { lineUserId }` → 回覆歡迎訊息 | 無有效 `lineUserId` 或 webhook 驗簽失敗 → 忽略並記錄錯誤 | 新使用者首次同步時自動建立 `User` 記錄 |
| LINE Login 網站登入 | 點選「使用 LINE 帳號登入」→ `/api/auth/line/login` → OAuth → `/api/auth/line/callback` → JWT → 前端存 token | Channel 未設定、state 不符或 `code` 無效 → 返回登入頁並顯示「尚未設定」 | 未建立 LINE Login Channel 時，入口仍存在但會回到登入頁 |
| 訪客瀏覽 | 不登入也能看到 `/app/*` 內容 | 新增/刪除操作會觸發 `requireLogin()`，顯示登入提示 | 沒有 token 時可觀摩畫面，但不能寫入 |
| 計畫 / 里程碑 / 日常任務 | 前端查詢 API → 後端 Prisma → 資料庫 | 401/403/查詢失敗 → UI 顯示錯誤與空狀態 | 新帳號為空，需手動新增 |
| LINE Bot 打卡 | 使用者傳訊息 → `detectIntent()` → 寫入 `SportLog` / `ToeicProgress` / `DailyTask` → 回覆確認 | 不是已知關鍵字 → fallback 回覆 | 無資料時不會自動生成紀錄 |
| 連結收藏 | 新增連結 → 自動分類 → `SavedLink` 寫入 | 未解鎖時 `requireUnlocked('links_unlocked')` → `FEATURE_LOCKED` | 空白：無連結，功能入口被鎖 |
| 覆盤中心 | 打卡達門檻 → `checkAndUnlockAchievements` → 解鎖 | 未登入、未達門檻或資料不足 → 顯示鎖定 | 空白帳號顯示鎖定畫面 |
| 每日任務提醒 | `node-cron` 每日固定時段推送 `getCheckListFlex()` | 發送失敗 → console 記錄錯誤，不中斷主流程 | 沒有 `lineUserId` 的使用者不會收到 |
| 週報提醒 | `node-cron` 每週固定時段推送 `getWeeklyReportFlex()` | 發送失敗 → console 記錄錯誤 | 沒有綁定 LINE 帳號時不會推播 |
| 解鎖通知 | 新解鎖後 `notifyUnlocks()` 透過 LINE push 通知 | 沒有 LINE 帳號或沒有新解鎖 → 忽略 | 初始均為未解鎖 |

### 已停用 / 已移除的功能

- 手機號碼＋驗證碼登入：`send-code` / `verify-code` API 保留，但沒有前端入口，已被正式移除出工作流程。
- `RegisterView.vue` / `/register` 路由：已不再使用，直接導回 `/login`。
- LIFF QR Code 登入入口：後端路由保留，但登入頁不連結，視為備用未啟用。
- 早期草稿功能名稱：`checkIn.ts` / `schedule.ts` / `review.ts` / `billing.ts` 從未真的存在，已從文件與實作中移除，避免誤導。
- 任何未用到的「假想 API」或「未接的擴充模組」皆不納入正式功能矩陣，除非已實作並有入口。

---

## 二、資料庫

**本機開發**：PostgreSQL 跑在 Docker（見專案根目錄 `docker-compose.yml`），`docker compose up -d` 啟動。連線字串在 `server/.env` 的 `DATABASE_URL`。

> 本機常見雷：這台機器上同時有原生安裝的 PostgreSQL 服務佔用 5432/5433，`docker-compose.yml` 把 container 對外開在 **5434**；也發生過 Docker Desktop 整個沒在跑（不是容器停了）的狀況，兩種都會讓後端連不上資料庫，排解方式見 [LOGIN_操作手冊.md](LOGIN_操作手冊.md) 常見問題。

Schema（`server/prisma/schema.prisma`）：

| Model | 用途 |
| --- | --- |
| `User` | `phone`、`lineUserId` 皆可為 null，三種登入方式共用同一張表 |
| `Plan` / `Milestone` | 計畫管理頁核心資料，都有 `userId` 外鍵，帳號間互相隔離 |
| `LinkRule` / `SavedLink` | 連結收藏：`SavedLink` 同時是 LINE 自動收藏與網頁手動新增的共用表 |
| `SportLog` | LINE 打卡紀錄（跑了幾公里等），跟下面 `SportCategoryTab`/`SportTodoItem` 是不同概念 |
| `ToeicProgress` | LINE 每日打卡（背單字/閱讀測驗等 boolean），跟下面 `ToeicProfile` 是不同概念 |
| `Project` | 作品集看板卡片，LINE 打卡（`dailyPct`）與網頁拖曳看板（`name`/`caption`/`status`）共用 |
| `DailyTask` | 一般學習/生活打卡，也是「臨時待辦事項」的資料表 |
| `ToeicProfile`（單筆）/`ToeicExamDate`/`ToeicTaskItem` | 「多益英文」頁面內容 |
| `SportCategoryTab`/`SportTodoItem` | 「運動」頁面的自訂分類分頁 + 待辦清單 |
| `RetroGoal` | 「覆盤中心」的長期目標卡片 |
| `Achievement` | 解鎖紀錄（`userId` + `key`），見下方§七 |

正式上線：把 `DATABASE_URL` 換成雲端 Postgres（Supabase/Railway）連線字串即可，schema 不用改（已經是 `provider = "postgresql"`）。

---

## 三、登入 + 訪客瀏覽模式

登入頁現在**只有 LINE 一種入口**（方式二）；方式一是 LINE 官方帳號加好友時自動觸發，不用畫面。方式三（手機驗證碼）的後端 API 還在，但前端已經拿掉，純粹備用。

### 訪客瀏覽模式 ✅

`/app/*` 底下**不需要登入就能進去**（路由守衛已移除），沒有 token 的訪客可以自由瀏覽整個後台介面，但：
- 所有需要登入的 API 查詢都用 `enabled: () => auth.isLoggedIn` 擋住，不會真的發請求，畫面自然呈現空狀態（不是後端回應空陣列，是前端根本沒問）
- 任何新增/刪除等操作（`core.openPlanModal()`、`core.removePlan()`、`core.deleteCustomModule()`……）都先呼叫 `auth.requireLogin()`：已登入才放行，訪客會跳出「請先登入」Modal（[src/stores/auth.ts](src/stores/auth.ts) 的 `requireLogin()`），不會真的打到後端（後端 `requireAuth` middleware 本來就會擋 401，前端這層純粹是提早給使用者明確的提示，而不是讓他們填完表單才發現不能送出）

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

原本是給還沒加 LINE 好友、想先體驗 demo 的人用，`server/src/routes/auth.ts` 的 `send-code`/`verify-code` 都還在（驗證碼沒接真實簡訊商，只是印在後端 console），但登入頁跟註冊頁都已經拿掉了，改成只用 LINE 登入 + 訪客瀏覽模式。示範帳號（`0912-345-678`）的種子資料因此暫時沒有畫面入口，見 [LOGIN_操作手冊.md](LOGIN_操作手冊.md)。

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

每次訊息/postback 處理完都會呼叫 `checkAndUnlockAchievements(userId)`（見§七），LINE 端的打卡活動也會計入覆盤中心的解鎖條件。

`services/ai.ts` 的 `detectIntent()` 目前是規則式（正規表示式關鍵字比對），**尚未接 Claude API**——這是刻意的：先把「訊息 → 結構化資料 → 存 DB → 回覆」整條路徑打通，之後只要把 `detectIntent()` 的實作換成呼叫 Claude API，呼叫端（webhook）完全不用改，因為回傳的 `Intent` 型別已經是 provider-agnostic 的設計。

---

## 五、臨時待辦事項 ✅

計畫性任務（`Plan`，固定排程）與臨時待辦（`DailyTask`，隨時新增）分開管理：

- **從 LINE 新增**：傳一般學習/生活類的訊息（見上表），會直接進 `DailyTask`，`source: 'line'`，且直接標記為已完成（LINE 端的語意是「回報已完成」，不是「提醒我做」）
- **從網頁新增**：計畫管理頁最下方「臨時待辦事項」區塊，手動輸入 → `POST /api/daily-tasks`，`source: 'web'`，預設未完成，可以點擊打勾／刪除

## 六、推播排程 ✅（cron 已啟動，尚未有真實 LINE 好友可推）

`server/src/services/reminder.ts` 用 `node-cron`，預設每天 08:00（`server/.env` 的 `DAILY_CHECKIN_CRON`/`DAILY_CHECKIN_TIMEZONE` 可調），對所有 `lineUserId` 不為空的使用者推播每日任務 CheckList。目前規劃裡的「21:00 完成率摘要／週一規劃／週五回顧／月總結」還沒實作，只有每日任務卡這一種推播。

---

## 七、解鎖機制 ✅

取代原本「收藏網址」的構想，改成**完成特定行為解鎖功能**——鎖的是「工具」分類底下的兩個項目：

| 工具 | 解鎖條件 | 判斷邏輯位置 |
| --- | --- | --- |
| 連結收藏 | 新增第一個計畫（`Plan` 數量 ≥ 1） | `server/src/lib/achievements.ts` |
| 覆盤中心 | 累積打卡次數達到 5 次（網頁「今日打卡」+ LINE 運動/多益/學習打卡都算） | 同上 |

實作方式：`Achievement` 表記錄 `userId` + `key`（`links_unlocked` / `retro_unlocked`）。`checkAndUnlockAchievements(userId)` 在「新增計畫」「今日打卡」「LINE 訊息處理完畢」這幾個時機點被呼叫，符合條件就寫一筆解鎖紀錄（已解鎖的不會重複判斷）。

前端：
- `GET /api/achievements` 回傳目前已解鎖的 key 列表，側邊欄「連結收藏」「覆盤中心」用這個資料決定要不要顯示鎖頭圖示（[src/components/common/LockedFeature.vue](src/components/common/LockedFeature.vue) 是點進未解鎖頁面時看到的鎖定畫面）
- 後端也有對應防護：`links.ts`/`retro.ts` 兩個 router 都掛了 `requireUnlocked(key)` middleware，未解鎖時 API 直接回 403 `FEATURE_LOCKED`，不是只有前端擋——前端拿到這個錯誤碼就切換成鎖定畫面

> 解鎖門檻（新增第一個計畫／5 次打卡）是這次沒有明確指定時的合理預設，之後想調整只要改 `server/src/lib/achievements.ts` 裡的門檻值或判斷邏輯。

---

## 八、自動排程設定檔（實際存在）

後端排程設定已經在 `server/.env.example` 與實際 `server/.env` 內定義，重點如下：

```env
DAILY_CHECKIN_CRON="0 8 * * *"
DAILY_CHECKIN_TIMEZONE="Asia/Taipei"
WEEKLY_REPORT_CRON="0 21 * * 5"
WEEKLY_REPORT_TIMEZONE="Asia/Taipei"
CRON_SECRET="replace-with-random-secret"
VERCEL_URL="https://your-app.vercel.app"
```

實際啟動位置：
- `server/src/index.ts`：`startDailyCheckinReminder()` / `startWeeklyReportReminder()`
- `server/src/services/reminder.ts`：`node-cron` 執行日/週提醒

這些設定不是草稿，而是已在程式碼中使用的 cron 設定檔。

---

## 九、部署架構（規劃中，目前只有本機開發環境）

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

## 十、還沒做的部分（依需不需要外部憑證排序）

1. **Claude API 待辦解析**（需要 Claude API Key）：把 `services/ai.ts` 的 `detectIntent()` 從規則式換成真的呼叫 Claude API。
2. **21:00/週報/月報推播**（不需外部憑證）：`reminder.ts` 目前只有每日任務卡一種排程，其餘規劃的推播時段還沒實作。
3. **覆盤中心的「本週達成率變化」「各分類達成率佔比」兩組圖表**（不需外部憑證，但需要設計怎麼從打卡紀錄算出分類佔比）：目前還是固定示意資料（`src/stores/retro.ts` 的 `weekBars`/`categoryShares`），只有「各項目標進度表」是真實資料。
4. **LINE Login 實際啟用**（需要 LINE Developers Console 建立 LINE Login Channel）：架構已完成，只差申請與環境變數，本機可測（支援 http://localhost）。
5. **LIFF 實際啟用 + 接回登入頁**（需要 LINE Developers Console 建立 LIFF App + https 網域）：架構已完成，目前登入頁沒有入口，之後若要支援「手機 LINE 內連動登入」再接回去。
6. **正式部署**（需要 Railway/Supabase/Vercel 帳號）：本機到雲端的落差主要是連線字串與網域。
