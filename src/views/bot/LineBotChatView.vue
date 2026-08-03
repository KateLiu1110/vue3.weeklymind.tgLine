<script setup lang="ts">
import BotChatShell from '@/components/bot/BotChatShell.vue'
</script>

<template>
  <div
    class="min-h-screen bg-cream-125 font-normal py-14 px-10"
    style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif"
  >
    <div class="max-w-6xl mx-auto mb-10 flex items-center gap-4 flex-wrap">
      <img src="/assets/mascot-dog-2.png" class="w-13.5 h-13.5 object-contain" />
      <div>
        <h1 class="m-0 font-medium text-ink-800" style="font-size: 28px; letter-spacing: -0.01em">
          WeeklyMind <span class="text-sand-400 font-normal">LINE Bot 互動情境</span>
        </h1>
        <p class="mt-1.5 text-sand-600" style="font-size: 14.5px">
          五大模組全部透過 LINE 對話完成 — 不需要開啟任何 App
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto flex gap-7.5 flex-wrap justify-center items-start">
      <!-- 01 每日任務卡 -->
      <BotChatShell caption="01 · 每日任務卡">
        <div class="text-center">
          <span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">今天 07:30</span>
        </div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[78%]" style="border-radius: 4px 16px 16px 16px">
            <p class="m-0 text-sm leading-relaxed text-ink-900">早安主人 ☀️ 今天的任務卡來囉，一共 8 項</p>
          </div>
        </div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[86%]">
            <div class="bg-brand-primary px-4 py-3.5 text-white flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">今日任務卡</div>
                <div class="text-xs opacity-85">7 月 8 日 · 星期三</div>
              </div>
              <div class="text-right">
                <div class="font-medium" style="font-size: 20px">0/8</div>
                <div class="text-xs opacity-85">已完成</div>
              </div>
            </div>
            <div class="px-4 pt-3.5 pb-2 flex flex-col gap-2.5">
              <div class="text-xs font-medium tracking-wide text-sand-500">🛒 採買</div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">雞胸肉、地瓜、燕麥</span></div>
              <div class="text-xs font-medium tracking-wide text-sand-500 mt-0.5">📖 讀書</div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">《原子習慣》30 頁</span></div>
              <div class="text-xs font-medium tracking-wide text-sand-500 mt-0.5">🏃 運動</div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">間歇跑 5km</span></div>
              <div class="text-xs font-medium tracking-wide text-sand-500 mt-0.5">🎯 每日目標</div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">學一個 Vue 3 概念</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">背 5 個英文單字</span></div>
            </div>
            <div class="flex border-t border-cream-150">
              <div class="flex-1 text-center py-3 text-sm font-medium text-brand-primary border-r border-cream-150">✓ 回報完成</div>
              <div class="flex-1 text-center py-3 text-sm font-medium text-sand-500">查看全部</div>
            </div>
          </div>
        </div>
      </BotChatShell>

      <!-- 02 自然語言打卡回應 -->
      <BotChatShell caption="02 · 自然語言打卡回應">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">18:42</span></div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[78%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">今天跑了6km，腳有點酸</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[78%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">6km 記錄完成！本週累計 22km 🏃 腳酸代表有練到，明天是休息日，好好恢復！</p></div>
        </div>
        <div class="text-center mt-1"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">20:15</span></div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[78%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">背了 eloquent / tenacious / pragmatic</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[78%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">三個單字記錄完成 ✅ 明天幫你複習 + 出例句！連續 14 天英文打卡 🔥</p></div>
        </div>
        <div class="text-center mt-1"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">21:30</span></div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[78%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">今天學了 Pinia Colada 的 useQuery</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[82%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">收到！已記錄到「前端知識」📚 連續第 8 天，繼續加油！明天建議學 staleTime 設定。</p></div>
        </div>
      </BotChatShell>

      <!-- 03 晚間完成率摘要 -->
      <BotChatShell caption="03 · 晚間完成率摘要">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">21:00</span></div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[86%]">
            <div class="px-4.5 pt-4.5 pb-1.5 text-center">
              <div class="relative w-[118px] h-[118px] mx-auto">
                <svg width="118" height="118" viewBox="0 0 118 118" style="transform: rotate(-90deg)">
                  <circle cx="59" cy="59" r="50" fill="none" class="stroke-cream-150" stroke-width="12" />
                  <circle
                    cx="59"
                    cy="59"
                    r="50"
                    fill="none"
                    class="stroke-brand-primary"
                    stroke-width="12"
                    stroke-linecap="round"
                    stroke-dasharray="314"
                    stroke-dashoffset="70"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="font-medium text-ink-800" style="font-size: 26px">78%</span>
                  <span class="text-xs text-sand-500">7/8 完成</span>
                </div>
              </div>
              <div class="mt-2.5 font-medium text-sm text-brand-primary">🔥 連續 14 天</div>
            </div>
            <div class="px-4.5 pb-4 pt-1.5">
              <p class="m-0 text-sm leading-relaxed text-ink-700">
                今天做得很棒！運動、讀書、每日目標都達成了，只差採買清單還沒回報。明天是休息日，運動任務會比較輕鬆，好好放鬆一下 🐾
              </p>
            </div>
          </div>
        </div>
        <div class="flex gap-2 justify-end pl-9.5">
          <div class="bg-white border border-brand-primary text-brand-primary rounded-full px-4 py-2 text-xs font-medium">補回報採買 🛒</div>
        </div>
      </BotChatShell>

      <!-- 04 週日下週計畫確認 -->
      <BotChatShell caption="04 · 週日下週計畫確認">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">週日 19:00</span></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[82%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">這週完成率 78%，幫你排好下週計畫了，快看看 👇</p></div>
        </div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[86%]">
            <div class="bg-clay-400 px-4 py-3.5 text-white">
              <div class="font-medium text-sm">下週計畫草案</div>
              <div class="text-xs opacity-90 mt-0.5">7/13 – 7/19</div>
            </div>
            <div class="px-4 py-3.5 flex flex-col gap-2.5">
              <div class="flex items-center gap-2.5"><span class="text-base">🛒</span><div class="flex-1"><div class="text-sm font-medium text-ink-900">採買清單</div><div class="text-xs text-sand-500">維持均衡飲食，預算 NT$900</div></div></div>
              <div class="flex items-center gap-2.5"><span class="text-base">📖</span><div class="flex-1"><div class="text-sm font-medium text-ink-900">讀書計畫</div><div class="text-xs text-sand-500">《原子習慣》每日 30 頁，預計週四完成</div></div></div>
              <div class="flex items-center gap-2.5"><span class="text-base">🏃</span><div class="flex-1"><div class="text-sm font-medium text-ink-900">運動企劃</div><div class="text-xs text-sand-500">維持強度，週三、週六休息</div></div></div>
              <div class="flex items-center gap-2.5"><span class="text-base">🎯</span><div class="flex-1"><div class="text-sm font-medium text-ink-900">每日目標</div><div class="text-xs text-sand-500">Vue 3 概念 + 英文單字，延續 streak</div></div></div>
            </div>
            <div class="flex border-t border-cream-150">
              <div class="flex-1 text-center py-3 text-sm font-medium text-brand-primary border-r border-cream-150">✓ 確認開始</div>
              <div class="flex-1 text-center py-3 text-sm font-medium text-sand-500">我要調整</div>
            </div>
          </div>
        </div>
      </BotChatShell>

      <!-- 05 週五週回顧報告 -->
      <BotChatShell caption="05 · 週五週回顧報告">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">週五 21:30</span></div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[88%]">
            <div class="bg-brand-primary px-4 py-3.5 text-white">
              <div class="font-medium text-sm">本週回顧報告</div>
              <div class="text-xs opacity-90">7/6 – 7/12</div>
            </div>
            <div class="px-4 pt-3.5 pb-1 flex items-end gap-1.5 h-[74px]">
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-sand-250 rounded-t" style="height: 32px" /><span class="text-[9.5px] text-sand-500">一</span></div>
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-brand-primary rounded-t" style="height: 48px" /><span class="text-[9.5px] text-sand-500">二</span></div>
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-brand-primary rounded-t" style="height: 44px" /><span class="text-[9.5px] text-sand-500">三</span></div>
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-brand-primary rounded-t" style="height: 56px" /><span class="text-[9.5px] text-sand-500">四</span></div>
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-brand-primary rounded-t" style="height: 60px" /><span class="text-[9.5px] text-sand-500">五</span></div>
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-sand-250 rounded-t" style="height: 20px" /><span class="text-[9.5px] text-sand-500">六</span></div>
              <div class="flex-1 flex flex-col items-center gap-1.5"><div class="w-full bg-sand-250 rounded-t" style="height: 14px" /><span class="text-[9.5px] text-sand-500">日</span></div>
            </div>
            <div class="px-4 py-3 flex flex-col gap-2 border-t border-cream-150">
              <div class="flex gap-2"><span class="text-sm">✨</span><p class="m-0 text-xs leading-relaxed text-ink-700"><b class="text-brand-primary">亮點</b> —《原子習慣》提前一天讀完，運動累計 22km 創新高</p></div>
              <div class="flex gap-2"><span class="text-sm">⚠️</span><p class="m-0 text-xs leading-relaxed text-ink-700"><b class="text-clay-400">待改進</b> — 週六、週日採買清單完成率偏低，建議提早排入行程</p></div>
              <div class="flex gap-2"><span class="text-sm">📌</span><p class="m-0 text-xs leading-relaxed text-ink-700"><b>下週建議</b> — 訓練強度維持，採買改到週五完成</p></div>
            </div>
          </div>
        </div>
      </BotChatShell>

      <!-- 06 任務卡摺疊 -->
      <BotChatShell caption="06 · 任務卡摺疊（≥5 項時預設收合已完成）">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">今天 12:30</span></div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[86%]">
            <div class="bg-brand-primary px-4 py-3.5 text-white flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">今日任務卡</div>
                <div class="text-xs opacity-85">7 月 8 日 · 星期三</div>
              </div>
              <div class="text-right">
                <div class="font-medium" style="font-size: 20px">3/8</div>
                <div class="text-xs opacity-85">已完成</div>
              </div>
            </div>
            <div class="px-4 pt-3.5 pb-2 flex flex-col gap-2.5">
              <div class="text-xs font-medium tracking-wide text-sand-500">待完成 · 5 項</div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">間歇跑 5km</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">《原子習慣》30 頁</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">補買雞胸肉、地瓜</span></div>
            </div>
            <div class="mx-4 mb-3.5 bg-cream-160 rounded-card px-3.5 py-2.5 flex items-center justify-between">
              <span class="text-xs font-medium text-sage-muted">✓ 已完成 3 項</span>
              <span class="text-xs font-medium text-clay-500">點擊展開 ⌄</span>
            </div>
            <div class="flex border-t border-cream-150">
              <div class="flex-1 text-center py-3 text-sm font-medium text-brand-primary border-r border-cream-150">✓ 回報完成</div>
              <div class="flex-1 text-center py-3 text-sm font-medium text-sand-500">查看全部 8 項</div>
            </div>
          </div>
        </div>
      </BotChatShell>

      <!-- 07 非預期輸入容錯 -->
      <BotChatShell caption="07 · 非預期輸入容錯（unknown intent 引導 + 停止連續追問）">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">15:20</span></div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[74%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">你今天心情怎麼樣</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[82%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">還不太懂你的意思～可以試試「今天跑了 5km」、貼一個連結給我，或點下面選單 🐾</p></div>
        </div>
        <div class="flex gap-2 justify-end flex-wrap pl-9.5">
          <div class="bg-white border border-brand-primary text-brand-primary rounded-full px-3.5 py-1.5 text-xs font-medium">今日任務卡</div>
          <div class="bg-white border border-brand-primary text-brand-primary rounded-full px-3.5 py-1.5 text-xs font-medium">查看進度</div>
          <div class="bg-white border border-gray-300 text-gray-500 rounded-full px-3.5 py-1.5 text-xs font-medium">聯絡客服</div>
        </div>
        <div class="text-center mt-1.5"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">15:21</span></div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[60%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">哈哈沒事</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[78%]" style="border-radius: 4px 16px 16px 16px">
            <p class="m-0 text-sm leading-relaxed text-ink-900">
              好的！我在這裡陪你，有任務要回報隨時說一聲 🐾<br />
              <span class="text-xs text-sand-450">（連續 2 次無法辨識，已停止自動追問，避免打擾）</span>
            </p>
          </div>
        </div>
      </BotChatShell>

      <!-- 08 多益每日 5 項打卡 -->
      <BotChatShell caption="08 · 多益每日 5 項打卡">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">車上通勤 · 08:10</span></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[80%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">通勤時間到！今天的多益 1 小時菜單 🚌</p></div>
        </div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[88%]">
            <div class="bg-clay-400 px-4 py-3.5 text-white flex items-center justify-between">
              <div class="font-medium text-sm">多益每日 5 項</div>
              <div class="font-medium" style="font-size: 18px">2/5</div>
            </div>
            <div class="px-4 py-3.5 flex flex-col gap-2.5">
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md bg-brand-primary shrink-0" /><span class="text-sm text-sand-450 line-through">🔤 背 20 個單字</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md bg-brand-primary shrink-0" /><span class="text-sm text-sand-450 line-through">📘 閱讀測驗 1 篇</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900 font-medium">✂️ 克漏字 1 篇</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">📗 英文課本 Unit 8</span></div>
              <div class="flex items-center gap-2.5"><span class="w-4.5 h-4.5 rounded-md border-2 border-sand-250 shrink-0" /><span class="text-sm text-ink-900">💬 每日對話 1 段</span></div>
            </div>
            <div class="flex border-t border-cream-150"><div class="flex-1 text-center py-3 text-sm font-medium text-clay-400">✓ 回報完成</div></div>
          </div>
        </div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[78%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">克漏字寫完了，錯了2題</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[80%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">記錄完成 3/5！錯的題目已存進複習庫，明天優先重考 💪 別忘了週三 19:00 英文課</p></div>
        </div>
      </BotChatShell>

      <!-- 09 運動分類打卡 -->
      <BotChatShell caption="09 · 運動分類打卡">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">19:20</span></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[78%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">運動完成了嗎？點選今天做了哪個項目 👇</p></div>
        </div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="flex gap-2 flex-wrap max-w-[88%]">
            <div class="bg-white border-[1.5px] border-brand-primary text-brand-primary rounded-full px-4 py-2 text-sm font-medium">🏋️ 健身力量</div>
            <div class="bg-white border-[1.5px] border-sand-200 text-ink-700 rounded-full px-4 py-2 text-sm font-medium">🧘 瑜珈</div>
            <div class="bg-white border-[1.5px] border-sand-200 text-ink-700 rounded-full px-4 py-2 text-sm font-medium">🏃 慢跑</div>
          </div>
        </div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[78%]" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-sm leading-relaxed text-accent-green-dark">健身力量 · 深蹲4x8+引體向上3x6</p></div></div>
        <div class="flex gap-2 items-end">
          <img src="/assets/mascot-dog-2.png" class="w-7.5 h-7.5 rounded-lg object-cover shrink-0 bg-white" />
          <div class="bg-white px-3.5 py-2.5 max-w-[80%]" style="border-radius: 4px 16px 16px 16px"><p class="m-0 text-sm leading-relaxed text-ink-900">記錄完成！總負重本月已 +4.2kg 📈 明天排的是瑜珈恢復日，好好放鬆</p></div>
        </div>
      </BotChatShell>

      <!-- 10 連結自動歸類確認 -->
      <BotChatShell caption="10 · 連結自動歸類確認">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">22:05</span></div>
        <div class="flex justify-end"><div class="bg-accent-green-bright px-3.5 py-2.5 max-w-[82%] break-all" style="border-radius: 16px 4px 16px 16px"><p class="m-0 text-xs leading-relaxed text-accent-green-dark">threads.net/@dev/post/react-perf-tips</p></div></div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[86%]">
            <div class="h-17.5 bg-cream-150 flex items-center justify-center text-2xl">🧵</div>
            <div class="px-3.5 py-3.5">
              <p class="m-0 mb-2 text-sm leading-relaxed text-ink-900">偵測到 Threads 連結，已自動歸入</p>
              <span class="inline-flex bg-success-bg-soft text-brand-primary text-xs font-medium px-2.5 py-1 rounded-full">📁 前端知識</span>
            </div>
            <div class="flex border-t border-cream-150">
              <div class="flex-1 text-center py-2.5 text-xs font-medium text-brand-primary">✓ 分類正確</div>
              <div class="flex-1 text-center py-2.5 text-xs font-medium text-sand-500 border-l border-cream-150">改分類</div>
            </div>
          </div>
        </div>
      </BotChatShell>

      <!-- 11 作品集里程碑倒數提醒 -->
      <BotChatShell caption="11 · 作品集里程碑倒數提醒">
        <div class="text-center"><span class="bg-black/14 text-white text-xs px-3 py-1 rounded-full">週一 09:00</span></div>
        <div class="flex gap-2 items-end">
          <div class="w-7.5 shrink-0" />
          <div class="bg-cream-50 border border-cream-150 rounded-card overflow-hidden max-w-[88%]">
            <div class="bg-clay-500 px-4 py-3.5 text-white text-center">
              <div class="font-medium" style="font-size: 26px">⏳ 52 天</div>
              <div class="text-xs opacity-90 mt-0.5">距離「我要去海外工作」目標日</div>
            </div>
            <div class="px-4 py-3.5">
              <p class="m-0 mb-2.5 text-sm leading-relaxed text-ink-700">作品集初版完成度 42%，本週還沒有推進任何任務。要不要先完成「關於我」頁面？</p>
              <div class="h-1.5 rounded-full bg-cream-150 overflow-hidden"><div class="h-full bg-brand-primary" style="width: 42%" /></div>
            </div>
            <div class="flex border-t border-cream-150">
              <div class="flex-1 text-center py-3 text-sm font-medium text-brand-primary">開始這項任務</div>
              <div class="flex-1 text-center py-3 text-sm font-medium text-sand-500 border-l border-cream-150">先跳過</div>
            </div>
          </div>
        </div>
      </BotChatShell>
    </div>
  </div>
</template>
