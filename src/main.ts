import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Chart, registerables } from 'chart.js'

import App from './App.vue'
import router from './router'

Chart.register(...registerables)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
