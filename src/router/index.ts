import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/register', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/liff/login',
      name: 'liff-login',
      component: () => import('../views/auth/LiffLoginView.vue'),
    },
    {
      path: '/login/line-callback',
      name: 'line-callback',
      component: () => import('../views/auth/LineCallbackView.vue'),
    },
    {
      path: '/line/notify',
      name: 'line-notify',
      component: () => import('../views/bot/LineNotifyView.vue'),
    },
    {
      path: '/line/bot',
      name: 'line-bot',
      component: () => import('../views/bot/LineBotChatView.vue'),
    },
    {
      path: '/app',
      component: () => import('../views/dashboard/DashboardLayout.vue'),
      children: [
        { path: '', redirect: { name: 'overview' } },
        {
          path: 'overview',
          name: 'overview',
          component: () => import('../views/dashboard/OverviewView.vue'),
        },
        {
          path: 'exec',
          name: 'exec',
          component: () => import('../views/dashboard/ExecView.vue'),
        },
        {
          path: 'toeic',
          name: 'toeic',
          component: () => import('../views/dashboard/ToeicView.vue'),
        },
        {
          path: 'portfolio',
          name: 'portfolio',
          component: () => import('../views/dashboard/PortfolioView.vue'),
        },
        {
          path: 'sport',
          name: 'sport',
          component: () => import('../views/dashboard/SportView.vue'),
        },
        {
          path: 'links',
          name: 'links',
          component: () => import('../views/dashboard/LinksView.vue'),
        },
        {
          path: 'retro',
          name: 'retro',
          component: () => import('../views/dashboard/RetroView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/dashboard/SettingsView.vue'),
        },
        {
          path: 'linebot',
          name: 'linebot',
          component: () => import('../views/dashboard/LineBotSettingsView.vue'),
        },
        {
          path: 'custom/:id',
          name: 'custom',
          component: () => import('../views/dashboard/CustomModuleView.vue'),
        },
      ],
    },
  ],
})

export default router
