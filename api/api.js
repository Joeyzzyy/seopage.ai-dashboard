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

const login = async (email, password) => {
    try {
        const response = await apiClient.post('/login', {email, password});
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// 新增获取用户列表接口
const getCustomerList = async () => {
    try {
        const response = await apiClient.get('/customer/list');
        return response.data;
    } catch (error) {
        console.error('Get customer list error:', error);
        throw error;
    }
};

// 上传关键词文件接口
const uploadKeywords = async (file, customerId, keywordType) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('customerId', customerId);
        formData.append('keywordType', keywordType);
        
        const response = await apiClient.post('/keywords', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
        });
        return response.data;
    } catch (error) {
        console.error('Upload keywords error:', error);
        throw error;
    }
};

// 搜索关键词接口
const searchKeywords = async (params) => {
    try {
        const response = await apiClient.get('/keywords/search', {
            params: {
                customerId: params.customerId,
                keyword: params.keyword,
                volume: params.volume,
                keywordDifficulty: params.keywordDifficulty,
                competitionDensity: params.competitionDensity,
                searchVolume: params.searchVolume,
                keywordType: params.keywordType,
                limit: params.limit,
                page: params.page
            }
        });
        return response.data;
    } catch (error) {
        console.error('Search keywords error:', error);
        throw error;
    }
};

// 修改导出方式
export { apiClient };
export const api = {
    login,
    getCustomerList,
    uploadKeywords,
    searchKeywords,
    apiClient
};