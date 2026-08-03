<script setup lang="ts"></script>

<template>
  <div
    class="min-h-screen bg-cream-55 font-normal py-14 px-10"
    style="font-family: 'Noto Sans TC', 'Space Grotesk', system-ui, sans-serif"
  >
    <div class="max-w-3xl mx-auto mb-10">
      <div
        class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-line-brand-bg text-teal-brand text-sm font-medium"
      >
        專業版 · LINE 通知
      </div>
      <h1 class="mt-4 text-gray-950 font-medium" style="font-size: 30px; letter-spacing: -0.01em">
        每日代辦推播
      </h1>
      <p class="mt-2 text-gray-500" style="font-size: 15px">
        每天早晨 07:30 推送任務卡到 LINE，鎖定畫面直接看，一鍵回報完成
      </p>
    </div>

    <div class="max-w-3xl mx-auto flex gap-10 flex-wrap justify-center items-start">
      <!-- Screen 1: lock screen push -->
      <div class="flex flex-col items-center gap-3.5">
        <div
          class="w-[280px] h-[500px] rounded-card overflow-hidden flex flex-col px-4 pt-14 pb-6"
          style="
            background: linear-gradient(
              165deg,
              var(--color-teal-dark) 0%,
              var(--color-teal-darker) 40%,
              var(--color-slate-dark) 100%
            );
          "
        >
          <div class="text-center text-white">
            <div class="font-medium opacity-85" style="font-size: 13px">7月8日 星期三</div>
            <div class="font-medium leading-none mt-1" style="font-size: 44px; letter-spacing: -0.02em">
              7:30
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-2.5">
            <div
              class="rounded-card p-3.5"
              style="background: rgba(255, 255, 255, 0.16); border: 0.5px solid rgba(255, 255, 255, 0.18)"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="w-6 h-6 rounded-lg bg-line-brand flex items-center justify-center shrink-0">
                  <span class="w-3 h-2.5 bg-white rounded" style="border-radius: 5px 5px 5px 1px" />
                </span>
                <span class="text-white font-medium text-xs">LINE</span>
                <span class="text-xs" style="color: rgba(255, 255, 255, 0.55)">· WeeklyMind</span>
                <span class="ml-auto text-xs" style="color: rgba(255, 255, 255, 0.55)">現在</span>
              </div>
              <div class="text-white font-medium text-sm">早安！今天有 3 項待辦 ☀️</div>
              <div class="text-xs leading-relaxed mt-1" style="color: rgba(255, 255, 255, 0.82)">
                間歇跑 5km · 閱讀 30 頁 · 補買雞胸肉。點開回報今天的進度。
              </div>
            </div>

            <div
              class="rounded-card px-3.5 py-3"
              style="background: rgba(255, 255, 255, 0.12); border: 0.5px solid rgba(255, 255, 255, 0.14)"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-5.5 h-5.5 rounded-lg bg-line-brand flex items-center justify-center shrink-0">
                  <span class="w-3 h-2 bg-white rounded" style="border-radius: 4px 4px 4px 1px" />
                </span>
                <span class="font-medium text-xs" style="color: rgba(255, 255, 255, 0.9)">LINE</span>
                <span class="ml-auto text-xs" style="color: rgba(255, 255, 255, 0.5)">昨天 21:00</span>
              </div>
              <div class="text-xs leading-relaxed" style="color: rgba(255, 255, 255, 0.8)">
                昨日完成率 <b class="text-white">88%</b> 🎉 本週累積達成 76%，繼續保持！
              </div>
            </div>
          </div>

          <div class="mt-auto text-center text-xs" style="color: rgba(255, 255, 255, 0.5)">
            向上滑動查看更多
          </div>
        </div>
        <span class="text-gray-400 font-medium text-sm">鎖定畫面推播</span>
      </div>

      <!-- Screen 2: LINE chat task card -->
      <div class="flex flex-col items-center gap-3.5">
        <div class="w-[280px] h-[500px] rounded-card overflow-hidden flex flex-col bg-line-chat-bg">
          <div class="bg-line-brand px-4 py-3.5 flex items-center gap-2.5 shrink-0">
            <span class="text-white text-lg">‹</span>
            <span class="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <span class="font-medium text-sm text-teal-brand">W</span>
            </span>
            <div class="flex-1">
              <div class="text-white font-medium text-sm">WeeklyMind</div>
              <div class="text-xs" style="color: rgba(255, 255, 255, 0.85)">LINE 官方帳號</div>
            </div>
            <span class="text-white text-base">☰</span>
          </div>

          <div class="flex-1 overflow-auto px-3.5 py-4 flex flex-col gap-3">
            <div class="text-center">
              <span
                class="text-white text-xs px-3 py-1 rounded-full"
                style="background: rgba(0, 0, 0, 0.14)"
                >今天 07:30</span
              >
            </div>

            <div class="flex gap-2 items-end">
              <span class="w-7.5 h-7.5 rounded-lg bg-white flex items-center justify-center shrink-0">
                <span class="font-medium text-xs text-teal-brand">W</span>
              </span>
              <div class="bg-white rounded-card px-3.5 py-2.5 max-w-[76%]" style="border-radius: 4px 16px 16px 16px">
                <p class="text-gray-950 text-sm leading-relaxed m-0">早安 ☀️ 這是你今天的代辦清單</p>
              </div>
            </div>

            <div class="flex gap-2 items-end">
              <div class="w-7.5 shrink-0"></div>
              <div class="bg-white rounded-card overflow-hidden max-w-[84%]">
                <div class="bg-teal-brand px-4 py-3.5 text-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium text-base">今日代辦</div>
                      <div class="text-xs opacity-85 mt-0.5">7 月 8 日 · 星期三</div>
                    </div>
                    <div class="text-right">
                      <div class="font-medium leading-none" style="font-size: 22px">0/3</div>
                      <div class="text-xs opacity-85">已完成</div>
                    </div>
                  </div>
                  <div class="h-1.5 rounded-full mt-3 overflow-hidden" style="background: rgba(255, 255, 255, 0.28)">
                    <div class="h-full bg-white" style="width: 0%" />
                  </div>
                </div>
                <div class="px-4 py-3.5 flex flex-col gap-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded-md border-2 border-gray-300 shrink-0" />
                    <div class="flex-1">
                      <div class="font-medium text-sm text-gray-950">間歇跑訓練 5km</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-solid" />
                        <span class="text-xs text-gray-400">運動 · 18:00</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded-md border-2 border-gray-300 shrink-0" />
                    <div class="flex-1">
                      <div class="font-medium text-sm text-gray-950">閱讀《原子習慣》30 頁</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-link-blue" />
                        <span class="text-xs text-gray-400">讀書 · 14:00</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2.5">
                    <span class="w-5 h-5 rounded-md border-2 border-gray-300 shrink-0" />
                    <div class="flex-1">
                      <div class="font-medium text-sm text-gray-950">補買雞胸肉、地瓜、燕麥</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-success-solid" />
                        <span class="text-xs text-gray-400">採買 · 11:00</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex border-t border-gray-100-alt">
                  <div class="flex-1 text-center py-3.5 text-sm font-medium text-teal-brand border-r border-gray-100-alt">
                    ✓ 回報完成
                  </div>
                  <div class="flex-1 text-center py-3.5 text-sm font-medium text-gray-500">查看全部</div>
                </div>
              </div>
            </div>

            <div class="flex gap-2 justify-end flex-wrap">
              <div class="bg-white border border-teal-brand text-teal-brand rounded-full px-4 py-2 text-xs font-medium">
                全部完成 ✅
              </div>
              <div class="bg-white border border-gray-300 text-gray-500 rounded-full px-4 py-2 text-xs font-medium">
                調整今日計畫
              </div>
            </div>
          </div>

          <div class="bg-white px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
            <span class="text-xl text-taupe">＋</span>
            <div class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-350">輸入訊息…</div>
            <span class="text-lg">😊</span>
          </div>
        </div>
        <span class="text-gray-400 font-medium text-sm">LINE 對話 · 任務卡</span>
      </div>
    </div>
  </div>
</template>
