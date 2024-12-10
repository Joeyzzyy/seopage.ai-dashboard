import axios from 'axios';
import { message } from 'ant-design-vue';

// 创建一个 axios 实例
const apiClient = axios.create({
  baseURL: 'https://strapi.sheet2email.com/v1', // 替换为实际的 API 基础地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 不需要 token 的接口列表
const noAuthUrls = ['/login'];

apiClient.interceptors.request.use(
    config => {
        // 检查当前请求是否在不需要 token 的列表中
        if (!noAuthUrls.includes(config.url)) {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                config.headers['Authorization'] = `${accessToken}`;
            }
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
          // 只保留核心验证相关的存储项
          localStorage.removeItem('accessToken');
          localStorage.removeItem('intelickIsLoggedIn');
          localStorage.removeItem('customers');
          localStorage.removeItem('currentUserId');

          if (error.response.data.message === 'User not find') {
            message.error('User not found');
          } else if (error.response.data.message === 'Invalid credentials') {
            message.error('Wrong username or password');
          } else {
            message.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
    }
);

const login = async (username, password) => {
    try {
        const response = await apiClient.post('/login', {username, password});
        return response.data;
    } catch (error) {
        console.error('登录失败:', error);
        return false;
    }
};

// 导出基础功能
export default {
    login,
    apiClient
};