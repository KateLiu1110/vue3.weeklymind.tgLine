import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { Chart, registerables } from 'chart.js'

import App from './App.vue'
import router from './router'
import { queryClient } from './plugins/queryClient'

Chart.register(...registerables)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
