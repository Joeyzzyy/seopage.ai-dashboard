import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';

const routes = [
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../components/LoginPage.vue'),
  },
  {
    path: '/',
    component: Home,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../components/DashboardPage.vue')
      },
      {
        path: '',
        redirect: '/dashboard'
      }
    ]
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});