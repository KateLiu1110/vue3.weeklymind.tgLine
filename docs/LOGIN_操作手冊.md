# 登入 / 帳號狀態 操作手冊

## 現況說明

現在是**真的帳號系統**了：後端有 `User` 表（[server/prisma/schema.prisma](server/prisma/schema.prisma)）。登入頁現在**只有 LINE 一種入口**（[src/views/auth/LoginView.vue](src/views/auth/LoginView.vue)），手機號碼＋簡訊驗證碼那條路已經從畫面上移除（後端 API 還留著沒刪，只是前端不再顯示，見下方說明）。

`/app/*` 底下所有頁面都需要登入才能進去，沒有 token 會被路由守衛（[src/router/index.ts](src/router/index.ts)）導回 `/login`；側邊欄「登出」按鈕會清掉 token 並導回登入頁（[src/stores/auth.ts](src/stores/auth.ts)）。

> ⚠️ **重要**：拿掉手機登入之後，**在還沒申請好 LINE Login Channel 之前，這個網站沒有任何方式可以登入**。這是預期中的狀態，不是 bug——要恢復可登入，照下面「登入方式」段落申請 LINE Login Channel、填好 `server/.env` 即可。

## 登入方式

登入頁「使用 LINE 帳號登入」按鈕，點下去會整頁導向 LINE 官方授權頁，授權完成自動導回並登入，不需要掃 QR Code、不需要另外註冊——第一次用某個 LINE 帳號登入時，後端會自動幫這個帳號建立資料（`upsert User { lineUserId }`）。

**要讓它動起來，需要**：
1. 在 [LINE Developers Console](https://developers.line.biz/console/) 建立一個新 Channel，類型選 **LINE Login**（跟你已經有的 Messaging API Channel 是不同類型，要另外建）
2. 該 Channel 設定裡的 **Callback URL** 填：`http://localhost:4000/api/auth/line/callback`
3. 把這個 Channel 的 **Channel ID**、**Channel Secret** 填進 `server/.env` 的 `LINE_LOGIN_CHANNEL_ID`、`LINE_LOGIN_CHANNEL_SECRET`，重啟後端

LINE Login 支援 `http://localhost` 當 callback，不像 LIFF 一定要 https，本機就能測到完整流程。技術細節見 [api-architecture.md](api-architecture.md) §3 方式二。

另外還有一種完全不用手動登入的方式：**加 LINE 好友的瞬間就自動建立帳號**（LINE 官方帳號的 follow 事件觸發），細節見 `api-architecture.md` §3 方式一。

> 原本做的「LIFF 掃 QR Code 登入」架構還在（`server/src/routes/liffAuth.ts`、`/liff/login` 頁面），但已經從登入頁移除入口——那個比較適合「手機已經在跟 LINE Bot 聊天，想連動登入桌面網頁」的情境，先保留程式碼、之後有需要再接回來。

## 手機號碼登入去哪了？

前端的手機號碼＋驗證碼登入畫面、「立即註冊」頁面都已經移除（`RegisterView.vue` 已刪除，`/register` 現在會直接導回 `/login`）。**後端的 API 沒有刪**（`server/src/routes/auth.ts` 的 `send-code`/`verify-code` 還在），只是沒有任何畫面會呼叫它們了，純粹是保留備用，不影響現在的行為。

**副作用**：示範帳號（`0912-345-678`，`server/prisma/seed.ts` 灌的 4 項計畫／2 項里程碑）綁定的是 `phone` 欄位，現在沒有入口可以用手機號碼登入，這筆示範資料暫時沒有畫面能看到。等你設定好 LINE Login、用自己的 LINE 帳號登入後，會是一個全新的空帳號（跟示範帳號是兩筆不同的資料），這是正常的——真實使用情境本來就應該是新帳號從空的開始，自己新增資料。

## 補充：右上角「預覽新帳號空白狀態」鈕

這顆按鈕（[src/views/dashboard/DashboardLayout.vue](src/views/dashboard/DashboardLayout.vue)）純粹是**展示用的前端濾鏡**——不會呼叫任何 API，只是把畫面上的 `plans`/`milestones` 暫時清空來預覽空白畫面長怎樣，方便 demo 時不用真的切換帳號。

## 已知限制：「多益英文／運動／作品集看板／連結收藏／覆盤中心」5 個分頁不受帳號狀態影響

這 5 個分頁目前是各自獨立的假資料 store，本來就不會因為切換帳號而清空或還原，這是既有限制（範圍只涵蓋「計畫管理」頁的計畫/里程碑/自訂模組）。之後如果要讓這幾頁也支援空白狀態，需要另外評估。

---

## 資料實際是怎麼出現的？（要開 DB 嗎？）

**要。** 這個專案現在是真的前後端分離架構，畫面上的計畫／里程碑資料不是寫死的，是「計畫管理」頁面透過網路請求向後端 API 拿的，後端再向 PostgreSQL 資料庫查詢：

```
瀏覽器 (Vue + TanStack Query + axios)
        │  GET /api/plans, GET /api/milestones
        ▼
Express API server（server/，預設 port 4000）
        │  Prisma ORM
        ▼
PostgreSQL（Docker 容器，本機 port 5434）
```

所以本機開發要**同時啟動三個東西**：Docker 裡的 Postgres、後端、前端。只跑 `npm run dev`（前端）畫面會出現黃色提示「無法連接後端伺服器」，且所有資料都會是空的（跟「新帳號」畫面長得很像，但其實是連不到後端，不是真的空帳號）。

### 啟動方式

**第一步：啟動資料庫（Docker）**
```bash
docker compose up -d
```
這會啟動一個本機 PostgreSQL 容器（設定在專案根目錄 `docker-compose.yml`），對外開在 **5434** port（不是預設的 5432，因為這台機器上 5432/5433 常常已經被別的 Postgres 服務占用，見下方常見問題）。

**第二步：啟動前後端**

推薦一個指令同時啟動：
```bash
npm run dev:full
```

或分開兩個終端機：
```bash
# 終端機 1：後端 API（port 4000）
cd server
npm run dev

# 終端機 2：前端（port 5173）
npm run dev
```

第一次跑後端前，記得先建好資料庫（只需做一次，或是改了 `server/prisma/schema.prisma` 之後）：
```bash
cd server
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts   # 灌入示範帳號的種子資料（4 項計畫、2 項里程碑，目前沒有畫面入口可看，見上方說明）
```

### 常見問題

- **畫面一直顯示「無法連接後端伺服器」**：確認 `server/` 有跑起來，且 4000 port 沒有被其他程式占用。這台機器上常見的情境是**別的專案**（例如另一個資料夾的前端）也預設用 4000 port，兩邊搶同一個 port 時，`localhost:4000` 可能連到不相干的專案而不是這裡的後端，導致回傳的不是預期的 JSON。可以用 `netstat -ano | grep :4000` 配合工作管理員確認 4000 port 目前是誰在用。
- **Docker 明明開過，怎麼又連不上資料庫**：Docker Desktop 本身可能整個被關掉了（不是容器停了，是整個應用程式沒在跑）。工作列圖示看不到鯨魚圖示就是沒在跑，重新打開 Docker Desktop、等它就緒、再 `docker compose up -d` 一次；容器資料存在 Docker volume 裡，不會因為這樣不見。
- **後端啟動時說連不到資料庫 / Prisma migrate 卡住**：先確認 `docker compose ps` 顯示 db 是 `Up`。這台機器上除了 Docker 容器，還有原生安裝的 PostgreSQL 服務常駐佔用 5432、5433，所以 `docker-compose.yml` 特地把容器開在 **5434** 對外——如果重灌或搬到別台機器，記得先確認 5434 沒被占用，被占用的話改 `docker-compose.yml` 的 port 對應，同時同步改 `server/.env` 的 `DATABASE_URL`。
- **登入頁按了「使用 LINE 帳號登入」又被導回來，顯示尚未設定**：`LINE_LOGIN_CHANNEL_ID`/`LINE_LOGIN_CHANNEL_SECRET` 還沒填，見上方「登入方式」段落申請並設定。
- **登入後又被導回登入頁**：token 可能已過期（30 天）或後端重啟過但 `JWT_SECRET` 換了（開發環境的 `JWT_SECRET` 寫死在 `server/.env`，不會每次重啟都變，除非你自己改）。重新登入一次即可。
- **新增計畫後，Modal 沒反應或資料消失**：已改成失敗會顯示紅字錯誤訊息並保留在 Modal 內，不會再靜默消失；出現錯誤代表後端沒連上，或 token 已失效（401），照上面步驟重新啟動後端／重新登入即可。
