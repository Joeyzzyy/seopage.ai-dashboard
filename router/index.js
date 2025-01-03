import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import DataUploadPage from '../components/DataUploadPage.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../components/DashboardPage.vue')
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../components/DashboardPage.vue')
      },
      {
        path: 'data-upload',
        name: 'DataUpload',
        component: DataUploadPage
      }
    ]
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});