<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions, type ChartType } from 'chart.js'

const props = defineProps<{
  type: ChartType
  data: ChartData
  options?: ChartOptions
  height?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function render() {
  if (!canvasRef.value) return
  const config: ChartConfiguration = {
    type: props.type,
    data: props.data,
    options: { responsive: true, maintainAspectRatio: false, ...props.options },
  }
  if (chart) {
    chart.config.data = config.data
    chart.config.options = config.options
    chart.update()
  } else {
    chart = new Chart(canvasRef.value, config)
  }
}

onMounted(render)
watch(() => [props.data, props.options], render, { deep: true })
onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div :style="{ height: (height ?? 160) + 'px' }">
    <canvas ref="canvasRef" />
  </div>
</template>
