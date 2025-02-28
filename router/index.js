import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import DataUploadPage from '../components/DataUploadPage.vue'
import Login from '../components/Login.vue'
import InitializationPage from '../components/InitializationPage.vue'
import EdmPage from '../components/EdmPage.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        redirect: '/initialization'
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
      },
      {
        path: 'package-config',
        name: 'PackageConfig',
        component: () => import('../components/PackageConfig.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'edm',
        name: 'EDM',
        component: EdmPage
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