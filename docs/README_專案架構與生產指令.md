# WeeklyMind 專案架構說明

## 專案性質
WeeklyMind 是一個個人自律管理系統：後台 Dashboard + LINE/Telegram Bot 雙向同步，
以「五大功能模組」為核心（採買清單／讀書計畫／運動企劃／每日 10 分鐘目標／作品集追蹤），
使用者透過聊天機器人打卡，後台即時反映進度。

## 設計來源檔案（Single Source of Truth）
`WeeklyMind 主控台 (standalone).html` — 已內嵌全部樣式/圖片/字型的單一 HTML 檔，可直接瀏覽器開啟預覽，是重建 Vue 專案的唯一比對基準。

## 頁面結構（側邊選單順序）
1. **計畫中心**（首頁）— 大目標宣言卡（可編輯）、月曆（含行程提醒）、里程碑（唯讀自動排序）、進行中的計畫（最多顯示 3 筆＋查看全部）、當前專注任務
2. **執行中心** — 核心能力雷達圖、本週階段進度長條圈、依計畫拆解的每日任務區塊（含子任務條列）
3. **多益英文**（目標模板原型）— 進度環＋考試天數＋模考分數、每日任務卡（含連續打卡）、分數趨勢圖
4. **看板模組**（看板模板原型）— 固定三欄「待辦／進行中／已完成」＋可自訂新增看板區，卡片可拖曳
5. **運動**（Tab模板原型）— 可自訂新增/刪除分類分頁，每個分頁各自的打卡清單
6. **連結收藏** — 貼上 IG/Threads/FB 連結，自動偵測平台分類，顯示連結縮圖
7. **覆盤中心** — 各項目標進度表、本週達成率長條圖、各分類達成率圓餅圖
8. **設定** — 個人資料、寵物頭像、通訊軟體綁定（LINE / Telegram 切換）、方案管理
9. **LineBot 設定** — 綁定通訊軟體、Bot 回覆語言、推播排程（早晨提醒/晚間回報/週覆盤）、手機模擬預覽
10. **自訂模組**（使用者透過「新增計畫」動態建立）— 依範本（目標/看板/Tab）複製對應原生頁面樣式，資料空白

另有：登入／註冊（LINE/Telegram 綁定切換）、LINE 通知模擬、LINE Bot 互動情境（五大對話場景）。

## 資料狀態邏輯
- **新帳號（demoEmpty）**：所有區塊顯示空白引導狀態＋「＋新增」入口，選單只保留核心頁面，進階模組需新增計畫才會解鎖出現。
- **有資料帳號**：計畫、里程碑、打卡紀錄、連續天數皆有資料，右上角切換鈕可一鍵切換兩種狀態方便 demo。

## 視覺規範
- 主色：墨綠 `#33513F`　輔助綠：`#1A5C38`　底色：奶油白 `#F7F1E4`　卡片底：`#E8F0EA`
- 文字：`#3A2E1E` / `#4A3B2B`（主要）、`#8A7C68` / `#A99A7E`（次要）
- 邊框：`#E4DAC4` / `#EFE6D3`　強調金棕：`#C9A876` / `#B08968`　危險色：`#C0563A`
- 圓角：控件 8px／卡片 12px　字重：僅 400/500　不使用 emoji，全站 SVG line icon
- 吉祥物：貴賓犬（SVG 線條）

## 技術規格（目標 Vue 專案）
Vue 3 + TypeScript + Vite、Pinia（狀態管理）、Vue Router 4、Tailwind CSS v4、
Chart.js 4（覆盤圖表）、vue-draggable-plus（看板拖曳）、vee-validate（表單驗證）、dayjs（日期/連續打卡計算）

---

# 生產專案指令（貼給 AI Coding Agent）

```
你是一個前端工程 agent，工作目錄裡有一個檔案：WeeklyMind 主控台 (standalone).html。
這是完整的單檔設計稿（已內嵌所有資源，可直接瀏覽器開啟預覽），用類 React 語法（<x-dc> 模板 + DCLogic class）寫成。

第一步（顏色，務必先做，不要跳過）：
1. 對這個檔案做文字搜尋，列出所有出現過的 6 碼 hex color 與各自出現次數，貼出完整清單給我看。
2. 用這份清單原封不動建立 Tailwind theme.extend.colors token（例如 brand-primary: '#33513F'），不要自己調整、不要用「看起來差不多」的顏色替代。
3. 全站元件一律用這些 token class，不要寫死 hex。

第二步（建立專案）：
4. 建立 Vue 3 + TypeScript + Vite 專案，含 Pinia、Vue Router 4、Tailwind CSS v4、Chart.js 4、vue-draggable-plus、vee-validate、dayjs。
5. 依檔案裡 <sc-if value="{{ tab.xxx }}"> 的區塊拆成 src/views/ 下獨立頁面元件：
   計畫中心 / 執行中心 / 多益英文 / 看板模組 / 運動 / 連結收藏 / 覆盤中心 / 設定 / LineBot設定，
   以及使用者動態新增的自訂模組（目標模板/看板模板/Tab模板，各自要重現對應原生頁面樣式但資料空白）。
6. 保留規範：圓角 8px（控件）/12px（卡片）、字重僅 400/500、不用 emoji（全用 SVG line icon）。
7. 將 DCLogic 的 state/method 轉為 Pinia store（核心 store 管 plans / customModules / milestones / botPlatform / botLang，其餘依頁面拆分）。
8. 登入/註冊頁的通訊軟體切換（LINE / Telegram）要跟 LineBot 設定頁共用同一 store 狀態。
9. 保留「新帳號（空白）」與「有資料帳號」兩種展示模式邏輯（demoEmpty 切換）。

第三步（驗收，做完才算完成）：
10. 用 grep 檢查所有 .vue 檔案有沒有殘留寫死的 hex 值（不是 token class 的），有的話全部改掉。
11. 列出「原始 hex → token 名稱 → 使用在哪些元件」的完整對照表給我確認。
12. 列出你的檔案結構規劃並確認可用 npm run dev 直接啟動。

先讀檔、列出檔案結構規劃，再開始寫程式，不要跳過分析直接生成。
```
