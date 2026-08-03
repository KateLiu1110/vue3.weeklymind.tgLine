<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { useCoreStore } from '@/stores/core'
import Icon from '@/components/common/Icon.vue'
import InlineEditText from '@/components/common/InlineEditText.vue'
import ChartCanvas from '@/components/common/ChartCanvas.vue'
import Modal from '@/components/common/Modal.vue'
import { themeColor } from '@/lib/themeColor'

const props = defineProps<{ moduleId: string }>()
const core = useCoreStore()
const mod = computed(() => core.customModules.find((m) => m.id === props.moduleId)!)

const ringOffset = computed(() => {
  const current = Number(mod.value.heroCurrent) || 0
  const target = Number(mod.value.heroTarget) || 0
  if (!target) return 264
  const pct = Math.min(current / target, 1)
  return 264 - 264 * pct
})

const scoreChartData = computed<ChartData<'bar'>>(() => ({
  labels: mod.value.scores.map((s) => s.label),
  datasets: [
    {
      data: mod.value.scores.map((s) => s.value),
      backgroundColor: themeColor('clay-400'),
      borderRadius: 4,
      maxBarThickness: 40,
    },
  ],
}))
const scoreChartOptions: ChartOptions<'bar'> = {
  scales: { x: { display: false }, y: { display: false } },
  plugins: { legend: { display: false } },
}
</script>

<template>
  <div class="flex gap-4.5 items-start flex-col xl:flex-row">
    <div class="flex-1 min-w-0 w-full">
      <div class="rounded-card p-5.5 flex items-center gap-5.5 mb-4.5 bg-cream-50 border border-cream-150">
        <div class="relative w-25 h-25 shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" style="transform: rotate(-90deg)">
            <circle cx="50" cy="50" r="42" fill="none" class="stroke-cream-150" stroke-width="11" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              class="stroke-clay-400"
              stroke-width="11"
              stroke-linecap="round"
              stroke-dasharray="264"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <InlineEditText
              v-model="mod.heroCurrent"
              placeholder="0"
              display-class="font-medium text-ink-800 text-lg"
              input-class="w-14 text-center font-medium text-ink-800 text-lg"
            />
            <InlineEditText
              v-model="mod.heroTarget"
              placeholder="目標"
              display-class="text-xs text-sand-500"
              input-class="w-16 text-center text-xs text-sand-500"
            />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <InlineEditText
            v-model="mod.heroTitle"
            placeholder="新增標題，如：多益目標 600 分"
            display-class="text-base font-medium text-ink-900 block"
            input-class="w-full text-base font-medium text-ink-900"
          />
          <InlineEditText
            v-model="mod.heroDesc"
            placeholder="新增描述，如：每日車上 1 小時，背單字、閱讀測驗"
            display-class="text-xs text-sand-600 block mt-1.5"
            input-class="w-full text-xs text-sand-600 mt-1.5"
          />
          <InlineEditText
            v-model="mod.heroSchedule"
            placeholder="新增固定行程，如：每週三 19:00 英文課"
            display-class="inline-flex items-center gap-1.5 mt-2 bg-cream-100 text-clay-500 text-xs font-medium px-2.5 py-1 rounded-full"
            input-class="mt-2 text-xs"
          />
        </div>
      </div>

      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-ink-800">每日任務</span>
        <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="core.openDailyTaskModal()">＋ 新增任務</span>
      </div>
      <div v-if="mod.dailyTasks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <div v-for="dt in mod.dailyTasks" :key="dt.id" class="rounded-card p-4 bg-cream-50 border border-cream-150">
          <div class="flex items-center justify-between gap-1.5">
            <span class="flex items-center gap-2 min-w-0 overflow-hidden cursor-pointer" @click="core.openDailyTaskModal(dt.id)">
              <Icon name="checkCircle" :size="15" :class="dt.done ? 'text-brand-primary' : 'text-sand-300'" />
              <span class="text-sm font-medium text-ink-900 overflow-hidden text-ellipsis whitespace-nowrap">{{ dt.title }}</span>
            </span>
            <span class="cursor-pointer text-danger shrink-0 flex" @click="mod.dailyTasks = mod.dailyTasks.filter((t) => t.id !== dt.id)">
              <Icon name="trash" :size="13" />
            </span>
          </div>
          <div class="h-1.5 rounded-full bg-cream-150 mt-2">
            <div class="h-full rounded-full" :class="dt.done ? 'bg-brand-primary' : 'bg-cream-150'" :style="{ width: dt.done ? '100%' : '0%' }" />
          </div>
          <div class="text-xs font-medium mt-2" :class="dt.done ? 'text-brand-primary' : 'text-sand-400'">
            {{ dt.done ? '已完成' : '待完成' }}
          </div>
        </div>
        <div class="rounded-card p-4 flex items-center justify-center gap-2 bg-cream-100">
          <Icon name="fire" :size="22" class="text-brand-primary" />
          <div>
            <div class="font-medium text-brand-primary" style="font-size: 17px">
              {{ mod.dailyTasks.filter((t) => t.done).length }} 天
            </div>
            <div class="text-xs text-sand-500">連續打卡</div>
          </div>
        </div>
      </div>
      <div v-else class="rounded-card text-center py-5 px-1 mb-3.5 bg-cream-50 border border-cream-150">
        <p class="m-0 text-xs font-medium text-sand-600">尚無每日任務</p>
        <p class="mt-1 mb-0 text-xs text-sand-400">點擊「＋ 新增任務」建立第一個每日任務</p>
      </div>

      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-sm font-medium text-ink-800">分數趨勢</span>
          <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="core.openScoreEntryModal()">＋ 新增分數</span>
        </div>
        <div v-if="mod.scores.length > 0">
          <ChartCanvas type="bar" :data="scoreChartData" :options="scoreChartOptions" :height="120" />
          <div class="flex gap-2.5 mt-1.5">
            <div v-for="sc in mod.scores" :key="sc.id" class="flex-1 flex items-center justify-center gap-1">
              <span class="text-xs text-sand-500 underline decoration-dotted cursor-pointer" @click="core.openScoreEntryModal(sc.id)">{{ sc.label }}</span>
              <span class="cursor-pointer text-danger flex" @click="mod.scores = mod.scores.filter((s) => s.id !== sc.id)"><Icon name="trash" :size="11" /></span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 px-1">
          <p class="m-0 text-xs font-medium text-sand-600">尚無分數紀錄</p>
          <p class="mt-1 mb-0 text-xs text-sand-400">點擊「＋ 新增分數」記錄第一筆成績</p>
        </div>
      </div>
    </div>

    <div class="w-full xl:w-60 shrink-0">
      <div class="rounded-card p-4.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3">
          <InlineEditText
            v-model="mod.examTitle"
            placeholder="新增標題"
            display-class="flex items-center gap-1.5 text-sm font-medium text-ink-800"
            input-class="text-sm font-medium text-ink-800 w-24"
          />
          <span class="text-xs text-brand-primary font-medium cursor-pointer" @click="core.openExamDateModal()">＋ 新增</span>
        </div>
        <p v-if="mod.examDates.length === 0" class="m-0 text-xs text-sand-400">尚未新增考試日期</p>
        <div v-else class="flex flex-col gap-3">
          <div v-for="ed in mod.examDates" :key="ed.id" class="bg-cream-100 rounded-card p-3 relative">
            <span
              class="absolute top-2.5 right-2.5 cursor-pointer text-danger flex"
              @click="mod.examDates = mod.examDates.filter((e) => e.id !== ed.id)"
            >
              <Icon name="trash" :size="13" />
            </span>
            <div class="text-xs font-medium text-ink-900 pr-4">{{ ed.title }}</div>
            <div class="text-xs text-sand-500 mt-0.5">{{ ed.date }}</div>
          </div>
        </div>
      </div>
      <div class="rounded-card p-4.5 mt-3.5 bg-cream-50 border border-cream-150">
        <div class="flex items-center justify-between mb-3">
          <InlineEditText
            v-model="mod.scoreTitle"
            placeholder="新增標題"
            display-class="text-sm font-medium text-ink-800"
            input-class="text-sm font-medium text-ink-800 w-24"
          />
          <span class="cursor-pointer text-sand-500 flex" @click="core.openGoalScoreModal()"><Icon name="edit" :size="14" /></span>
        </div>
        <template v-if="mod.targetScore">
          <div class="flex justify-between items-center py-2.5 border-b border-dashed border-cream-150">
            <span class="text-xs text-sand-600">{{ mod.lastLabel }}</span>
            <span class="font-medium text-ink-900 text-base">{{ mod.lastScore }}</span>
          </div>
          <div class="flex justify-between items-center pt-2.5">
            <span class="text-xs text-sand-600">{{ mod.targetLabel }}</span>
            <span class="font-medium text-brand-primary text-base">{{ mod.targetScore }}</span>
          </div>
        </template>
        <p v-else class="m-0 text-xs text-sand-400 leading-relaxed">
          尚未設定，點擊右上角編輯圖示新增（如：自媒體觀看人數、1 個月前 / 1 個月後）
        </p>
      </div>
    </div>

    <Modal :title="core.dailyTaskEditId ? '編輯每日任務' : '新增每日任務'" :width="380" v-if="core.dailyTaskModalOpen" @close="core.closeDailyTaskModal()">
      <label class="text-xs font-medium text-ink-700">任務名稱</label>
      <input
        v-model="core.dailyTaskForm.title"
        placeholder="例：背 20 個單字"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.dailyTaskTouched && !core.dailyTaskForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <p v-if="core.dailyTaskTouched && !core.dailyTaskForm.title.trim()" class="text-danger text-xs mb-2.5">⚠ 請填寫任務名稱</p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closeDailyTaskModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="core.saveDailyTask()">儲存</button>
      </div>
    </Modal>

    <Modal v-if="core.scoreEntryModalOpen" :title="core.scoreEntryEditId ? '編輯分數' : '新增分數'" :width="380" @close="core.closeScoreEntryModal()">
      <label class="text-xs font-medium text-ink-700">標籤（如：6 月模擬）</label>
      <input
        v-model="core.scoreEntryForm.label"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.scoreEntryTouched && !core.scoreEntryForm.label.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">紀錄</label>
      <input
        v-model="core.scoreEntryForm.value"
        type="number"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.scoreEntryTouched && !core.scoreEntryForm.value.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <p v-if="core.scoreEntryTouched && (!core.scoreEntryForm.label.trim() || !core.scoreEntryForm.value.trim())" class="text-danger text-xs mb-2.5">
        ⚠ 請填寫標籤與紀錄
      </p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closeScoreEntryModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="core.saveScoreEntry()">儲存</button>
      </div>
    </Modal>

    <Modal v-if="core.examDateModalOpen" title="新增目標" :width="380" @close="core.closeExamDateModal()">
      <label class="text-xs font-medium text-ink-700">目標名稱</label>
      <input
        v-model="core.examDateForm.title"
        placeholder="請填寫目標，如：多益公開測驗"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.examDateTouched && !core.examDateForm.title.trim() ? 'border-coral' : 'border-sand-200'"
      />
      <label class="text-xs font-medium text-ink-700">達成日期</label>
      <input
        v-model="core.examDateForm.date"
        type="date"
        class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border bg-white text-sm text-ink-900 outline-none"
        :class="core.examDateTouched && !core.examDateForm.date ? 'border-coral' : 'border-sand-200'"
      />
      <p v-if="core.examDateTouched && (!core.examDateForm.title.trim() || !core.examDateForm.date)" class="text-danger text-xs mb-2.5">
        ⚠ 請填寫達成目標與日期
      </p>
      <div class="flex gap-2.5 mt-2">
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closeExamDateModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="core.saveExamDate()">儲存</button>
      </div>
    </Modal>

    <Modal v-if="core.goalScoreModalOpen" title="設定分數目標" :width="380" @close="core.closeGoalScoreModal()">
      <label class="text-xs font-medium text-ink-700">項目一標題</label>
      <input v-model="core.goalScoreForm.lastLabel" placeholder="例：上次模考 / 1 個月前" class="w-full mt-1.5 mb-3 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">項目一數值</label>
      <input v-model="core.goalScoreForm.lastScore" placeholder="例：450 或 1.2萬" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">項目二標題</label>
      <input v-model="core.goalScoreForm.targetLabel" placeholder="例：本次目標 / 1 個月後" class="w-full mt-1.5 mb-3 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <label class="text-xs font-medium text-ink-700">項目二數值</label>
      <input v-model="core.goalScoreForm.targetScore" placeholder="例：600 或 3萬" class="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-control border border-sand-200 bg-white text-sm text-ink-900 outline-none" />
      <div class="flex gap-2.5 mt-2">
        <span class="cursor-pointer text-danger flex items-center px-1" @click="core.clearGoalScoreForm()"><Icon name="trash" :size="16" /></span>
        <button type="button" class="flex-1 py-2.5 rounded-control border border-sand-200 text-ink-700 text-sm font-medium cursor-pointer" @click="core.closeGoalScoreModal()">取消</button>
        <button type="button" class="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-sm font-medium cursor-pointer" @click="core.saveGoalScoreForm()">儲存</button>
      </div>
    </Modal>
  </div>
</template>
