# WeeklyMind

個人自律管理系統：後台 Dashboard + LINE Bot 雙向同步。使用者透過聊天機器人打卡，網頁後台即時反映進度。五大功能模組：採買清單／讀書計畫／運動企劃／每日 10 分鐘目標／作品集追蹤。

技術棧：Vue 3 + TypeScript + Vite（前端）、Express + Prisma + PostgreSQL（後端）、Pinia、Vue Router 4、TanStack Query、Tailwind CSS v4、Chart.js、LINE Messaging API / LINE Login。

這份文件是**全專案文件索引**——所有 `.md` 文件依用途分類列在下面，之後要找東西直接從這裡點過去即可，不用整個資料夾翻找。

---

## 📖 我該先看哪一份？

| 我想做的事 | 該看的文件 |
| --- | --- |
| 第一次接手這個專案，想知道它是什麼、怎麼跑起來 | 本文件「快速開始」＋ [docs/README_專案架構與生產指令.md](docs/README_專案架構與生產指令.md) |
| 想知道網站每一頁長怎樣、怎麼操作 | 📘 [docs/網站操作手冊.md](docs/網站操作手冊.md) |
| 想部署到正式站（Vercel / Railway / Supabase） | 🚀 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| 想知道登入機制、為什麼登不進去 | [docs/LOGIN_操作手冊.md](docs/LOGIN_操作手冊.md) |
| 想知道某個功能的 API、資料表、解鎖條件 | [docs/api-architecture.md](docs/api-architecture.md) |
| 想知道每個功能目前是「已上線／保留未啟用／已刪除」 | [docs/專案功能操作手冊.md](docs/專案功能操作手冊.md) §8 |
| 想調整顏色、找 Tailwind token 對應的原始色碼 | [docs/color-tokens.md](docs/color-tokens.md) |

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

前端 [http://localhost:5173](http://localhost:5173)，後端 API [http://localhost:8080](http://localhost:8080)（見 [.env.local.example](.env.local.example)）。詳細啟動流程、常見連不上的問題，見 [docs/LOGIN_操作手冊.md](docs/LOGIN_操作手冊.md)。

---

## 📂 文件分類索引

### 1. 專案架構與規劃

| 文件 | 內容 |
| --- | --- |
| [docs/README_專案架構與生產指令.md](docs/README_專案架構與生產指令.md) | 專案定位、頁面結構、視覺規範、給 AI coding agent 的原始生產指令 |
| [docs/api-architecture.md](docs/api-architecture.md) | 現況架構圖（前後端目錄結構）、功能狀態矩陣（正向/反向/初始狀態）、資料庫 schema 對照表、三種登入方式技術細節 |
| [docs/color-tokens.md](docs/color-tokens.md) | 90 個原始 hex 色碼 → Tailwind token 完整對照表，含各 token 實際使用元件 |

### 2. 部署與維運

| 文件 | 內容 |
| --- | --- |
| 🚀 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | **上線部署指南**：Vercel（前端）+ Railway（後端）+ Supabase（資料庫）完整架構圖、環境變數、LINE 推播排程設定、已踩過的坑（Supabase IPv6 連線問題）、部署後驗證清單 |

### 3. 操作手冊

| 文件 | 內容 |
| --- | --- |
| 📘 [docs/網站操作手冊.md](docs/網站操作手冊.md) | **圖文操作手冊**：每一頁畫面截圖 + 操作說明，含訪客模式、登入後的完整後台導覽、LINE 推播情境 |
| [docs/LOGIN_操作手冊.md](docs/LOGIN_操作手冊.md) | 登入機制詳解（LINE 加好友 / LINE Login / 已停用的手機驗證碼）、資料實際怎麼來（前後端分離架構圖）、常見連線問題排解 |
| [docs/專案功能操作手冊.md](docs/專案功能操作手冊.md) | 逐功能列出操作入口、對應 API、初始狀態、反向狀態；LINE Bot 關鍵字打卡對照表；功能啟用狀態總表 |

### 4. 設計原始檔

| 檔案 | 內容 |
| --- | --- |
| [WeeklyMind 主控台 (standalone).html](<WeeklyMind 主控台 (standalone).html>) | 已內嵌全部樣式/圖片/字型的單一 HTML 設計稿，可直接瀏覽器開啟預覽，是視覺還原的比對基準（不是給使用者操作的正式產品） |
| [line-flex-sample.json](line-flex-sample.json) / [line-newtask-sample.json](line-newtask-sample.json) | LINE Flex Message 範例 JSON，供 `server/src/services/line.ts` 組裝訊息時參考 |

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
├── docs/                補充文件（顏色 token、操作手冊、截圖）
└── docker-compose.yml   本機開發用 PostgreSQL
```

完整技術細節見 [docs/api-architecture.md](docs/api-architecture.md)。
