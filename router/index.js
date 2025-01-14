import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import DataUploadPage from '../components/DataUploadPage.vue'
import Login from '../components/Login.vue'
import InitializationPage from '../components/InitializationPage.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        redirect: '/dashboard'
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
      },
      {
        path: 'initialization',
        name: 'Initialization',
        component: InitializationPage
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});