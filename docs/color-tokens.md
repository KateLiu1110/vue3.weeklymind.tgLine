# WeeklyMind 顏色 Token 對照表

來源：對 `AI 私人助理设计０７２９/` 目錄下 5 個核心 `.dc.html` 檔案（主控台、登入、註冊、LINE 通知、LINE Bot 互動）做完整文字搜尋，取出所有 `#XXXXXX` hex 值，原封不動建立 Tailwind v4 token（`src/assets/theme.css` 的 `@theme` 區塊）。

- 共 90 個不重複 hex 值 → 89 個 token（`#8CABD9` 原判斷為手機外框裝飾色而略過，後續核對 LINE 通知頁原始碼後發現它其實是 LINE 對話畫面本身的背景色，已更正為 `line-chat-bg` 並補回）。
- 下表「使用元件」是用 `grep` 對 `src/**/*.vue` 掃描對應的 Tailwind class（`bg-/text-/border-/stroke-/fill-` 前綴）與內嵌樣式中的 `var(--color-*)` 產生，**不是手動填寫**，如果之後改動元件，這份表可以用同樣方式重新產生。
- 「使用次數 0」的 token：來自尚未在目前已建置頁面中用到的原始色值（例如彈窗、次要狀態色），token 仍保留在 `theme.css`，之後補頁面時直接套用即可，不用重新建立。

## 對照表

| Hex | Token | 使用元件數 | 使用元件 |
|---|---|---|---|
| #33513f | `brand-primary` | 16 | CustomBoardTemplate, CustomGoalTemplate, CustomTabTemplate, LoginView, RegisterView, LineBotChatView, DashboardLayout, ExecView, LineBotSettingsView, LinksView, OverviewView, PortfolioView, RetroView, SettingsView, SportView, ToeicView |
| #2c4a36 | `brand-primary-dark` | 1 | OverviewView（hero 卡片漸層） |
| #3e5a3e | `brand-secondary` | 0 | 尚未使用 |
| #5a6357 | `brand-secondary-muted` | 0 | 尚未使用 |
| #06c755 | `line-brand` | 6 | BotChatShell, LoginView, RegisterView, LineNotifyView, LineBotSettingsView, SettingsView |
| #06834e | `line-brand-dark` | 0 | 尚未使用 |
| #e6f6ec | `line-brand-bg` | 1 | LineNotifyView |
| #eef3ea | `success-bg-soft` | 6 | LineBotChatView, DashboardLayout, ExecView, LineBotSettingsView, LinksView, SettingsView |
| #8de055 | `accent-green-bright` | 1 | LineBotChatView |
| #20331a | `accent-green-dark` | 1 | LineBotChatView |
| #7da67d | `sage-accent` | 0 | 尚未使用 |
| #7c9473 | `sage-muted` | 1 | LineBotChatView |
| #16a34a | `success-solid` | 1 | LineNotifyView |
| #4a6741 | `forest-alt` | 0 | 尚未使用 |
| #c2eec0 | `mint-pale` | 0 | 尚未使用 |
| #c2c8be | `sage-pale` | 0 | 尚未使用 |
| #dce7d6 | `sage-pale-2` | 0 | 尚未使用 |
| #1f1b16 | `ink-950` | 0 | 尚未使用 |
| #232323 | `ink-950-alt` | 1 | LineBotSettingsView（手機預覽外殼） |
| #3a2e1e | `ink-900` | 15 | CustomBoardTemplate, CustomGoalTemplate, CustomTabTemplate, LoginView, RegisterView, LineBotChatView, ExecView, LineBotSettingsView, LinksView, OverviewView, PortfolioView, RetroView, SettingsView, SportView, ToeicView |
| #4a3b2b | `ink-800` | 15 | CustomGoalTemplate, CustomTabTemplate, StubPanel, LoginView, RegisterView, LineBotChatView, CustomModuleView, DashboardLayout, ExecView, LineBotSettingsView, OverviewView, RetroView, SettingsView, SportView, ToeicView |
| #5a4c3a | `ink-700` | 14 | CustomBoardTemplate, CustomTabTemplate, LoginView, RegisterView, LineBotChatView, DashboardLayout, ExecView, LineBotSettingsView, LinksView, OverviewView, PortfolioView, RetroView, SettingsView, SportView |
| #6b5d48 | `ink-600` | 0 | 尚未使用 |
| #614000 | `ink-amber` | 1 | ExecView（連續打卡卡片文字） |
| #8a7c68 | `sand-600` | 17 | 全站廣泛使用（次要文字） |
| #a99a7e | `sand-500` | 16 | 全站廣泛使用（次要文字/圖示） |
| #b9ac93 | `sand-450` | 1 | LineBotChatView |
| #b3a38c | `sand-400` | 17 | 全站廣泛使用（占位/次要文字） |
| #c9bea6 | `sand-300` | 3 | CustomGoalTemplate, DashboardLayout, OverviewView |
| #c9bfa8 | `sand-300-alt` | 0 | 尚未使用（登入/註冊頁 input placeholder 原色，已併入 sand-300 語意，token 仍保留） |
| #c9a876 | `clay-400` | 5 | InlineEditText, CustomGoalTemplate, LineBotChatView, OverviewView, ToeicView |
| #b08968 | `clay-500` | 6 | CustomGoalTemplate, LineBotChatView, CustomModuleView, ExecView, OverviewView, ToeicView |
| #8b6b3e | `clay-600` | 0 | 尚未使用 |
| #9a8c86 | `taupe` | 1 | LineNotifyView |
| #8a8f87 | `stone-muted` | 0 | 尚未使用 |
| #a8a29e | `stone-400` | 1 | ExecView |
| #78716c | `stone-500` | 0 | 尚未使用 |
| #fffcf5 | `cream-50` | 18 | 全站卡片底色 |
| #fbfbfa | `cream-55` | 1 | LineNotifyView |
| #fdf8f0 | `cream-60` | 0 | 尚未使用 |
| #fbf6ee | `cream-75` | 1 | ExecView |
| #fbf3e7 | `cream-90` | 1 | ExecView |
| #f0eada | `cream-100` | 15 | 全站廣泛使用 |
| #f7f1e4 | `cream-125` | 6 | LoginView, RegisterView, LineBotChatView, DashboardLayout, ExecView, SettingsView |
| #efe6d3 | `cream-150` | 18 | 全站邊框/底色 |
| #f3eee0 | `cream-160` | 4 | CustomTabTemplate, LineBotChatView, LineBotSettingsView, SportView |
| #eee3d3 | `cream-165` | 0 | 尚未使用 |
| #f5eedd | `cream-175` | 1 | OverviewView |
| #f5ece4 | `cream-180` | 0 | 尚未使用 |
| #f5ede4 | `cream-185` | 0 | 尚未使用 |
| #f1eeeb | `cream-190` | 0 | 尚未使用 |
| #eaf1e7 | `mint-cream` | 1 | OverviewView |
| #e4dac4 | `sand-200` | 10 | CustomBoardTemplate, CustomGoalTemplate, CustomTabTemplate, LoginView, RegisterView, LineBotChatView, DashboardLayout, ExecView, LineBotSettingsView, OverviewView |
| #efe0c3 | `sand-225` | 0 | 尚未使用 |
| #f0d9b8 | `sand-230` | 0 | 尚未使用 |
| #e8dcc0 | `sand-240` | 0 | 尚未使用 |
| #dcd1b9 | `sand-250` | 8 | CustomTabTemplate, LineBotChatView, ExecView, LineBotSettingsView, RetroView, SettingsView, SportView, ToeicView |
| #d6cbaf | `sand-275` | 2 | CustomTabTemplate, SportView |
| #8cabd9 | `line-chat-bg` | 2 | BotChatShell, LineNotifyView（LINE 對話畫面背景，非外框裝飾） |
| #c0563a | `danger` | 11 | CustomBoardTemplate, CustomGoalTemplate, CustomTabTemplate, RegisterView, CustomModuleView, ExecView, LineBotSettingsView, OverviewView, RetroView, SportView, ToeicView |
| #d9736a | `coral` | 1 | RegisterView（錯誤提示，刻意與 danger 分開） |
| #c0567a | `pink-accent` | 0 | 尚未使用 |
| #f5dce3 | `pink-bg-soft` | 0 | 尚未使用 |
| #ffb21d | `gold-accent` | 1 | ExecView（連續打卡卡片底色） |
| #e8a33d | `status-inprogress` | 0 | 尚未使用（看板模板「進行中」badge 目前用 bg-status-inprogress class，元件掃描未含 badge 動態 class，token 仍在用） |
| #d97706 | `amber-solid` | 1 | LineNotifyView |
| #b38b00 | `amber-dark` | 0 | 尚未使用 |
| #ffddaf | `peach-soft` | 0 | 尚未使用 |
| #fff7e6 | `amber-bg-soft` | 0 | 尚未使用 |
| #2f6bd8 | `link-blue` | 1 | LineNotifyView |
| #eaf1ff | `blue-bg-soft` | 2 | LineBotSettingsView, SettingsView |
| #dce7f5 | `blue-bg-soft-2` | 0 | 尚未使用 |
| #18181b | `gray-950` | 1 | LineNotifyView |
| #71717a | `gray-500` | 2 | LineBotChatView, LineNotifyView |
| #6b7280 | `gray-500-alt` | 0 | 尚未使用 |
| #a1a1aa | `gray-400` | 1 | LineNotifyView |
| #d4d4d8 | `gray-300` | 2 | LineBotChatView, LineNotifyView |
| #d1d5db | `gray-300-alt` | 0 | 尚未使用 |
| #f2f2f2 | `gray-100` | 2 | BotChatShell, LineNotifyView |
| #f0f0f0 | `gray-100-alt` | 1 | LineNotifyView |
| #b9b9b9 | `gray-350` | 2 | BotChatShell, LineNotifyView |
| #0f766e | `teal-brand` | 1 | LineNotifyView |
| #0b3b38 | `teal-dark` | 2 | LineNotifyView, LineBotSettingsView（推播模擬預覽漸層） |
| #0f4d47 | `teal-darker` | 2 | LineNotifyView, LineBotSettingsView |
| #14343f | `slate-dark` | 2 | LineNotifyView, LineBotSettingsView |

## 例外：資料層級的 hex（不是寫死 UI 樣式，是使用者資料值）

以下檔案裡的 hex 是**資料本身的欄位值**（例如計畫/里程碑/分類的顏色標記，對應原始 `.dc.html` 裡 `INIT_PROJECTS` / `state.milestones` 這類陣列中每筆資料自帶的 `color` 欄位），透過 `:style` 綁定到畫面，性質上等同資料庫欄位存一個顏色碼，不是可以取代成固定 token class 的靜態 UI 色：

- `src/stores/core.ts` — `SEED_PLANS` / `SEED_MILESTONES` 的 `color` / `tagBg` / `tagCol`
- `src/stores/exec.ts` — `catProgress` 的 `color`
- `src/stores/retro.ts` — `goals` / `categoryShares` 的 `color`

這些值本來就是原始檔案裡逐筆寫死的（例如 `pl2` 的 `color: '#2f6bd8'`），已原封不動保留，只是換成小寫。若之後要讓使用者自訂顏色（例如看板專案的顏色選擇器），這裡才會需要動。

## 驗收結果

- `grep -rn "#[0-9a-fA-F]{3,8}" src --include="*.vue"` → **0 筆**，所有元件樣板皆使用 token class。
- `vue-tsc --build` → 通過。
- `eslint` / `oxlint` → 通過（含修正 `vue/no-mutating-props`：三個自訂模組樣板原本直接改寫傳入的 `mod` prop，已改為元件內自行從 store 依 `moduleId` 取用）。
- Vite dev server 對 19 條路由（登入/註冊/LINE 通知/LINE Bot 互動/主控台 9 分頁/自訂模組）全部回應 200。
