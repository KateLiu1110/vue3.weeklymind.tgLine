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
│   │   ├── auth.ts            # fetchMe()（手機驗證碼那兩支已從前端移除，見下方§三）
│   │   └── liffAuth.ts        # LIFF QR Code 登入（已建好，登入頁未連結）
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
│   │   ├── ai.ts               # 規則式意圖判斷（關鍵字比對）
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

---

## 二、資料庫

**本機開發**：PostgreSQL 跑在 Docker（見專案根目錄 `docker-compose.yml`），`docker compose up -d` 啟動。連線字串在 `server/.env` 的 `DATABASE_URL`。

> 本機常見雷：這台機器上同時有原生安裝的 PostgreSQL 服務佔用 5432/5433，`docker-compose.yml` 把 container 對外開在 **5434**；也發生過 Docker Desktop 整個沒在跑（不是容器停了）的狀況，兩種都會讓後端連不上資料庫。

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

- **LINE 加好友自動註冊＋登入**：使用者加 LINE 好友 → webhook `follow` 事件觸發 → 自動 `upsert User { lineUserId }`，帳號即可使用，不需要額外畫面
- **LINE Login 登入網站**：登入頁「使用 LINE 帳號登入」按鈕 → 導向 LINE 官方授權頁 → 授權完成導回並簽發 JWT（架構已完成，尚未在 LINE Developers Console 申請正式 Channel，目前按下去會顯示「LINE 登入尚未設定」）
- **手機號碼＋驗證碼**：後端 `send-code`/`verify-code` API 仍保留，但登入頁與註冊頁已移除入口，非正式登入方式
- **訪客瀏覽模式**：`/app/*` 不需登入即可瀏覽整個後台介面；需要登入的資料查詢在未登入時不會發送請求，畫面呈現空狀態；任何新增/刪除等寫入操作會先跳出「請先登入」提示，不會真的打到後端

---

## 四、LINE Bot 訊息處理 ✅

`server/src/routes/lineWebhook.ts` 依訊息內容分派：

| 使用者說 | 判斷方式（`services/ai.ts`，規則式關鍵字比對） | 動作 | 對應網頁功能 |
| --- | --- | --- | --- |
| 貼一個網址 | URL 格式判斷 | 依 `LinkRule` 自動歸類，存進 `SavedLink`，回傳 Flex 卡片確認分類 | 連結收藏 |
| 「跑了5公里」 | 關鍵字 + 抽取數字 | 存進 `SportLog`，回報本週累計公里數 | 運動（Tab 型範本） |
| 「背了20個單字」「閱讀測驗」等 | 關鍵字 | upsert 當天 `ToeicProgress` | 多益英文（目標型範本） |
| 「學了 Vue」「看了 React」等 | 關鍵字 | 存進 `DailyTask`（`source: 'line'`，直接標記已完成） | 計劃管理的臨時待辦事項 |
| 「任務」 | 精確比對 | 回傳當天的每日任務 CheckList（Flex Message，即時讀 `ToeicProgress`/`Project`） | — |
| 其他文字 | fallback | 隨機回覆聊天訊息 | — |

LINE 與網頁共用同一批資料表，兩邊打卡即時互相同步——在 LINE 傳訊息記錄的進度，回到網頁對應頁面就能立刻看到。每次訊息/postback 處理完都會呼叫 `checkAndUnlockAchievements(userId)`（見§七），LINE 端的打卡活動也會計入覆盤中心的解鎖條件。

---

## 五、臨時待辦事項 ✅

- **計畫性任務（`Plan`）與臨時待辦（`DailyTask`）分開管理**：前者固定排程，後者隨時新增
- **從 LINE 新增**：傳一般學習/生活類訊息（見上表）→ 直接進 `DailyTask`，`source: 'line'`，直接標記為已完成
- **從網頁新增**：「計劃管理」頁最下方「臨時待辦事項」區塊手動輸入 → `POST /api/daily-tasks`，`source: 'web'`，預設未完成，可打勾／刪除

## 六、推播排程 ✅

- **技術實作**：`server/src/services/reminder.ts` 用 `node-cron`
- **推播時間**：預設每天 08:00，可用 `DAILY_CHECKIN_CRON`/`DAILY_CHECKIN_TIMEZONE` 調整
- **推播對象**：所有 `lineUserId` 不為空的使用者
- **推播內容**：目前僅有每日任務 CheckList 一種（cron 已啟動，尚未有真實 LINE 好友可推）

---

## 七、解鎖機制 ✅

- **解鎖對象**：「工具」分類底下的「連結收藏」與「覆盤中心」兩個項目
- **連結收藏解鎖條件**：新增第一個計畫（`Plan` 數量 ≥ 1）
- **覆盤中心解鎖條件**：累積打卡次數達 5 次（網頁「今日打卡」＋ LINE 運動/多益/學習打卡皆計入）
- **判斷邏輯**：`server/src/lib/achievements.ts` 的 `checkAndUnlockAchievements(userId)`，在新增計畫／今日打卡／LINE 訊息處理完畢時觸發，符合條件就寫入 `Achievement` 表（`userId` + `key`，已解鎖不重複判斷）
- **前端顯示**：`GET /api/achievements` 取得已解鎖清單，側邊欄與未解鎖頁面依此顯示鎖頭圖示（[src/components/common/LockedFeature.vue](../src/components/common/LockedFeature.vue)）
- **後端防護**：`links.ts`/`retro.ts` 皆掛 `requireUnlocked(key)` middleware，未解鎖時回 403 `FEATURE_LOCKED`

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
