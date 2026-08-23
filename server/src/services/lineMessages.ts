/**
 * LINE Bot 訊息的多語言字典。目前只覆蓋「歡迎訊息」「每日任務 CheckList」「週報」
 * 「覆盤分析」這幾個使用者主動觸發、或排程主動推播的核心訊息（呼應需求裡的「Bot 推播
 * 日文範例」），其餘散落在 lineWebhook.ts 各個 intent 分支裡的簡短確認回覆（例如
 * 「記錄完成！繼續保持💪」）暫時維持中文，之後要擴充只要照這個字典的形狀繼續加。
 */
export type BotLang = 'zh' | 'en' | 'ja'

export function normalizeBotLang(lang: string | null | undefined): BotLang {
  return lang === 'en' || lang === 'ja' ? lang : 'zh'
}

// 語言關鍵字不綁定使用者當下的 botLang 設定——不管設定的語言是什麼，三種語言的
// 關鍵字都認得，回覆內容再依 botLang 決定用哪個語言，體驗上更寬容。
export const CHECKLIST_KEYWORDS = ['任務', 'Tasks', 'tasks', 'タスク']
export const WEEKLY_REPORT_KEYWORDS = ['週報', 'Report', 'report', 'Weekly Report']
export const RETRO_KEYWORDS = ['覆盤', 'Retro', 'retro', '振り返り']

export const M = {
  welcome: {
    zh: '歡迎加入 WeeklyMind 🐾 帳號已經自動建立好了！\n直接跟我說「今天跑了5公里」「背了20個單字」，或傳連結給我，我都會幫你記錄。\n輸入「任務」看今天的打卡清單、「週報」看本週回顧、「覆盤」看長期目標分析（解鎖後才看得到喔）。',
    en: "Welcome to WeeklyMind 🐾 Your account is ready to go!\nJust tell me things like \"ran 5km today\" or \"learned 20 words\", or send me a link and I'll save it.\nType \"Tasks\" for today's checklist, \"Report\" for your weekly review, or \"Retro\" for long-term goal analysis (once unlocked).",
    ja: 'WeeklyMind へようこそ 🐾 アカウントは自動的に作成されました！\n「今日5km走った」「単語を20個覚えた」のように話しかけるか、リンクを送ってください。\n「タスク」で今日のチェックリスト、「週報」で週次レビュー、「振り返り」で長期目標の分析が見られます（解除後）。',
  },
  checklistTitle: { zh: '📝 每日任務 CheckList', en: '📝 Daily Task CheckList', ja: '📝 デイリータスク チェックリスト' },
  checklistNoDailyTasks: { zh: '尚無每日任務，到 App 新增', en: 'No daily tasks yet — add one in the app', ja: 'まだ毎日のタスクがありません。アプリで追加してください' },
  checklistNoTabItems: { zh: '尚無項目，到 App 新增', en: 'No items yet — add one in the app', ja: 'まだ項目がありません。アプリで追加してください' },
  checklistNoBoardTodo: { zh: '待辦欄尚無卡片，到 App 新增', en: 'No cards in To-do yet — add one in the app', ja: '「待辦」列にカードがありません。アプリで追加してください' },
  newTaskTitle: { zh: '🎉 新任務已加入', en: '🎉 New Task Added', ja: '🎉 新しいタスクを追加しました' },
  taskUpdatedTitle: { zh: '🔔 打卡事項已更新', en: '🔔 Checklist Updated', ja: '🔔 チェックリストが更新されました' },
  newPlanKindGoal: { zh: '目標模板', en: 'Goal Template', ja: '目標テンプレート' },
  newPlanKindBoard: { zh: '看板模板', en: 'Board Template', ja: '看板テンプレート' },
  newPlanKindTab: { zh: 'Tab 模板', en: 'Tab Template', ja: 'タブテンプレート' },
  newTaskHint: {
    zh: '輸入「任務」查看今日打卡卡片，現在就可以打卡了',
    en: 'Type "Tasks" to see today\'s checklist — it\'s ready to check in now',
    ja: '「タスク」と入力すると今日のチェックリストが見られます。今すぐチェックインできます',
  },
  checklistDoneAll: { zh: '一鍵完成所有項目', en: 'Mark all as done', ja: 'すべて完了にする' },
  checklistCheckin: { zh: '打卡', en: 'Check in', ja: 'チェックイン' },
  checklistChecked: { zh: '已完成', en: 'Done', ja: '完了済み' },
  weeklyTitle: { zh: '📊 本週回顧', en: '📊 Weekly Review', ja: '📊 週次レビュー' },
  weeklyTotalLabel: { zh: '本週累計打卡', en: 'Check-ins this week', ja: '今週のチェックイン回数' },
  weeklyTotalUnit: { zh: '次', en: 'times', ja: '回' },
  weeklyPlansLabel: { zh: '目前計畫進度', en: 'Current plan progress', ja: '現在の計画の進捗' },
  weeklyNoPlans: { zh: '尚無進行中的計畫', en: 'No plans in progress', ja: '進行中の計画はありません' },
  retroTitle: { zh: '🔍 覆盤分析', en: '🔍 Retro Analysis', ja: '🔍 振り返り分析' },
  retroEmpty: {
    zh: '尚未新增覆盤目標，先到 App「覆盤中心」建立第一個長期目標',
    en: 'No retro goals yet — head to the "Retro Center" in the app to add your first long-term goal.',
    ja: 'まだ振り返り目標がありません。アプリの「振り返りセンター」で最初の長期目標を作成してください。',
  },
  retroLocked: {
    zh: '覆盤中心還沒解鎖喔，累積 5 次打卡（網頁或 LINE 都算）就會自動解鎖 🔒',
    en: "Retro Center isn't unlocked yet — check in 5 times (web or LINE both count) to unlock it automatically 🔒",
    ja: 'まだ振り返りセンターは解除されていません。5回チェックインする（Webでも LINE でもOK）と自動解除されます 🔒',
  },
  retroOngoing: {
    zh: (elapsed: number) => `持續進行・已 ${elapsed} 天`,
    en: (elapsed: number) => `Ongoing・Day ${elapsed}`,
    ja: (elapsed: number) => `継続中・${elapsed} 日目`,
  },
  retroPlanned: {
    zh: (total: number, day: number) => `預計 ${total} 天・目前第 ${day} 天`,
    en: (total: number, day: number) => `${total}-day plan・Day ${day}`,
    ja: (total: number, day: number) => `${total}日間の予定・${day}日目`,
  },
} as const

type StringKeys = { [K in keyof typeof M]: (typeof M)[K][BotLang] extends string ? K : never }[keyof typeof M]

/** 純文字訊息用這支；retroOngoing/retroPlanned 是帶參數的函式，直接用 M.xxx[lang](...) 呼叫。 */
export function t(lang: BotLang, key: StringKeys): string {
  return M[key][lang] as string
}
