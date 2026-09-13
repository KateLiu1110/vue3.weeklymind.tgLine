# WeeklyMind

- **這是什麼**：個人自律管理系統：後台 Dashboard + LINE Bot 雙向同步。使用者透過聊天機器人打卡，網頁後台即時反映進度。五大功能模組：採買清單／讀書計畫／運動企劃／每日 10 分鐘目標／作品集追蹤。
- **技術棧**：Vue 3 + TypeScript + Vite（前端）、Express + Prisma + PostgreSQL（後端）、Pinia、Vue Router 4、TanStack Query、Tailwind CSS v4、Chart.js、LINE Messaging API / LINE Login。
- **文件索引**：這份文件是全專案文件索引——所有 `.md` 文件依用途分類列在下面，之後要找東西直接從這裡點過去即可，不用整個資料夾翻找。

---

## 視覺規範

- **主色**：墨綠 `#33513F`　**輔助綠**：`#1A5C38`　**底色**：奶油白 `#F7F1E4`　**卡片底**：`#E8F0EA`
- **文字**：`#3A2E1E` / `#4A3B2B`（主要）、`#8A7C68` / `#A99A7E`（次要）
- **邊框**：`#E4DAC4` / `#EFE6D3`　**強調金棕**：`#C9A876` / `#B08968`　**危險色**：`#C0563A`
- **圓角**：控件 8px／卡片 12px　**字重**：僅 400/500　不使用 emoji，全站 SVG line icon
- **吉祥物**：貴賓犬（SVG 線條）

## 技術規格（目標 Vue 專案）

- Vue 3 + TypeScript + Vite
- Pinia（狀態管理）
- Vue Router 4
- Tailwind CSS v4
- Chart.js 4（覆盤圖表）
- vue-draggable-plus（看板拖曳）
- vee-validate（表單驗證）
- dayjs（日期／連續打卡計算）

---

## 🗂 專案目錄速覽

```
├── src/                前端 Vue 3 專案
│   ├── views/           路由頁面（dashboard/ 為登入後主要頁面、auth/ 登入相關、bot/ LINE 模擬畫面）
│   ├── stores/           Pinia（UI 狀態）
│   ├── composables/       TanStack Query（伺服器狀態，每個資源一組 use<X>()）
│   ├── api/              axios client + API 呼叫
│   └── router/           路由設定
├── server/              後端 Express + Prisma
│   ├── src/routes/        API 路由
│   ├── src/services/      LINE 訊息、推播排程、意圖判斷
│   ├── src/lib/           JWT、解鎖條件判斷
│   └── prisma/            schema.prisma + migrations + seed.ts
├── docs/                補充文件（操作手冊、架構文件、截圖）
└── docker-compose.yml   本機開發用 PostgreSQL
```

- 完整技術細節見 [docs/api-architecture.md](docs/api-architecture.md)。

---

## 🚀 快速開始（本機開發）

```bash
# 1. 啟動本機資料庫（PostgreSQL，Docker，對外 port 5434）
docker compose up -d

# 2. 第一次跑後端前，建表 + 灌示範資料（之後改了 schema 才需要重跑）
cd server
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
cd ..

# 3. 同時啟動前後端
npm install
npm run dev:full
```

- **前端**：[http://localhost:5173](http://localhost:5173)
- **後端 API**：[http://localhost:8080](http://localhost:8080)（環境變數設定見 [.env.local.example](.env.local.example)）
- **常見連線問題**（本機資料庫 port 衝突、Docker 未啟動等）：見 [docs/api-architecture.md](docs/api-architecture.md) 「資料庫」一節

---

## 📂 文件分類索引

| 檔案名稱 | 我想做的事 | 內容 |
| --- | --- | --- |
| 本文件 | 第一次接手這個專案，想知道它是什麼、怎麼跑起來 | 「快速開始」＋「視覺規範」／「技術規格」 |
| 📘 [docs/網站操作手冊.md](docs/網站操作手冊.md) | 想知道網站每一頁長怎樣、怎麼操作 | 每一頁畫面截圖 + 操作說明，含訪客模式、登入後的完整後台導覽、LINE 推播情境 |
| [docs/專案功能操作手冊.md](docs/專案功能操作手冊.md) §8 | 想知道每個功能目前是「已上線／保留未啟用／已刪除」 | 逐功能列出操作入口、對應 API、初始狀態、反向狀態；LINE Bot 關鍵字打卡對照表；功能啟用狀態總表 |
| [docs/api-architecture.md](docs/api-architecture.md) | 想知道登入機制、某個功能的 API、資料表、解鎖條件 | 現況架構圖（前後端目錄結構）、功能狀態矩陣、資料庫 schema 對照表、登入＋訪客瀏覽模式、LINE Bot 訊息處理、解鎖機制 |
| 🚀 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 想部署到正式站（Vercel / Railway / Supabase） | 部署架構圖、環境變數、LINE 推播排程設定（檔案未提交版本庫，內含正式環境變數，需向專案維護者索取） |
| [line-flex-sample.json](line-flex-sample.json) / [line-newtask-sample.json](line-newtask-sample.json) | 想參考 LINE 推播卡片怎麼組 | LINE Flex Message 範例 JSON，供 `server/src/services/line.ts` 組裝訊息時參考 |
