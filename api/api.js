import axios from 'axios';
import { message } from 'ant-design-vue';

// 创建一个 axios 实例 - 用于原有接口
const apiClient = axios.create({
//   baseURL: 'https://api.websitelm.com/v1', 
  baseURL: 'https://api.zhuyuejoey.com/v1', 
  timeout: 300000, // 修改为5分钟 (300000毫秒)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建一个新的 axios 实例 - 用于 Page Components API
const componentApiClient = axios.create({
  baseURL: 'https://agents.zhuyuejoey.com/', // Page Components API 基础地址
  timeout: 300000, // 5分钟超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 不需要 token 的接口列表
const noAuthUrls = ['/login'];

// 原有 API 客户端的拦截器
apiClient.interceptors.request.use(
    config => {
        // 检查当前请求是否在不需要 token 的列表中
        if (!noAuthUrls.includes(config.url)) {
            const accessToken = localStorage.getItem('adminaccesstoken');
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
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
          localStorage.removeItem('adminaccesstoken');
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

// Page Components API 客户端的拦截器
componentApiClient.interceptors.request.use(
    config => {
        // 为 Page Components API 添加认证
        const accessToken = localStorage.getItem('adminaccesstoken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

componentApiClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
          // 只保留核心验证相关的存储项
          localStorage.removeItem('adminaccesstoken');
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

// 获取用户列表接口
const getCustomerList = async (params = {}) => {
    try {
        const response = await apiClient.get('/customer/list', {
            params: {
                email: params.email,
                page: params.page,
                limit: params.limit,
                minWebsiteCount: params.minWebsiteCount,
                maxWebsiteCount: params.maxWebsiteCount,
                minResultCount: params.minResultCount,
                maxResultCount: params.maxResultCount,
                minDeployCount: params.minDeployCount,
                maxDeployCount: params.maxDeployCount,
                subscribeFilter: params.subscribeFilter,
                domainBindFilter: params.domainBindFilter
            }
        });
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
        
        const response = await apiClient.post('admin/keywords', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 300000, // 修改为5分钟
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
        const response = await apiClient.get('admin/keywords/search', {
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

// 上传 top 页面列表接口
const uploadTopPages = async (file, customerId, domainName) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('customerId', customerId);
        formData.append('domainName', domainName);
        
        const response = await apiClient.post('admin/top-pages', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 300000, // 修改为5分钟
        });
        return response.data;
    } catch (error) {
        console.error('Upload top pages error:', error);
        throw error;
    }
};

// 获取 top pages 列表接口
const getTopPages = async (params) => {
    try {
        const response = await apiClient.get('admin/top-pages', {
            params: {
                customerId: params.customerId,
                domainName: params.domainName,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get top pages error:', error);
        throw error;
    }
};

// 上传 top page URL 关键词列表接口
const uploadTopPageKeywords = async (file, customerId, topURL) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('customerId', customerId);
        formData.append('topURL', topURL);
        
        const response = await apiClient.post('admin/top-pages/keyword', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 300000, // 修改为5分钟
        });
        return response.data;
    } catch (error) {
        console.error('Upload top page keywords error:', error);
        throw error;
    }
};

// 获取 top pages keywords 列表接口
const getTopPageKeywords = async (params) => {
    try {
        const response = await apiClient.get('admin/top-pages/keyword', {
            params: {
                customerId: params.customerId,
                topURL: params.topURL,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get top page keywords error:', error);
        throw error;
    }
};

// 添加关键词分析接口
const startAnalysis = async (customerId) => {
    try {
        const response = await apiClient.post('/planning/analysis', null, {
            params: { customerId }
        });
        return response.data;
    } catch (error) {
        console.error('Start analysis error:', error);
        throw error;
    }
};

// 获取套餐功能列表接口
const getPackageFeatures = async () => {
    try {
        const response = await apiClient.get('/features-package');
        return response.data;
    } catch (error) {
        console.error('Get package features error:', error);
        throw error;
    }
};

// 创建套餐功能接口
const createPackageFeature = async (featureData) => {
    try {
        const response = await apiClient.post('/features-package', featureData);
        return response.data;
    } catch (error) {
        console.error('Create package feature error:', error);
        throw error;
    }
};

// 删除套餐功能接口
const deletePackageFeature = async (packageId) => {
    try {
        const response = await apiClient.delete(`/features-package/${packageId}`);
        return response.data;
    } catch (error) {
        console.error('Delete package feature error:', error);
        throw error;
    }
};

// 更新套餐功能接口
const updatePackageFeature = async (packageId, featureData) => {
    try {
        const response = await apiClient.put(`/features-package/${packageId}`, featureData);
        return response.data;
    } catch (error) {
        console.error('Update package feature error:', error);
        throw error;
    }
};

// 申请免费试用接口
const applyTrialPackage = async (trialData) => {
    try {
        const response = await apiClient.post('/admin/trial-package', trialData);
        return response.data;
    } catch (error) {
        console.error('Apply trial package error:', error);
        throw error;
    }
};

// 获取免费试用列表接口
const getTrialPackages = async (params) => {
    try {
        const response = await apiClient.get('/admin/trial-package', {
            params: {
                customerId: params.customerId,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get trial packages error:', error);
        throw error;
    }
};

// 删除免费试用申请接口
const deleteTrialPackage = async (trialId) => {
    try {
        const response = await apiClient.delete(`/admin/trial-package/${trialId}`);
        return response.data;
    } catch (error) {
        console.error('Delete trial package error:', error);
        throw error;
    }
};

// 更新免费试用申请接口
const updateTrialPackage = async (trialId, trialData) => {
    try {
        const response = await apiClient.put(`/admin/trial-package/${trialId}`, trialData);
        return response.data;
    } catch (error) {
        console.error('Update trial package error:', error);
        throw error;
    }
};

// 批量发送邮件接口
const batchSendEmail = async (emailData) => {
    try {
        const response = await apiClient.post('/admin/batch/send-email', {
            emails: emailData.emails,
            html: emailData.html,
            subject: emailData.subject,
            sendEmail: emailData.sendEmail,
            sendName: emailData.sendName,
            replyTo: emailData.replyTo
        });
        return response.data;
    } catch (error) {
        console.error('Batch send email error:', error);
        throw error;
    }
};

// 获取批量发送邮件列表接口
const getBatchEmailList = async (params) => {
    try {
        const response = await apiClient.get('/admin/batch/send-email', {
            params: {
                batchId: params.batchId,
                email: params.email,
                startTime: params.startTime,
                endTime: params.endTime,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get batch email list error:', error);
        throw error;
    }
};

// 上传数据表结构接口
const uploadTableStructure = async (file, customerId) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('customerId', customerId);
        
        const response = await apiClient.post('admin/table-structure', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 300000, // 5分钟超时
        });
        return response.data;
    } catch (error) {
        console.error('Upload table structure error:', error);
        throw error;
    }
};

// 获取数据表结构列表接口
const getTableStructures = async (params) => {
    try {
        const response = await apiClient.get('admin/table-structure', {
            params: {
                customerId: params.customerId,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get table structures error:', error);
        throw error;
    }
};

// 运营后台登录客户账号接口
const adminLoginAsCustomer = async (customerId) => {
    try {
        const response = await apiClient.post('/admin/login', { customerId });
        return response.data;
    } catch (error) {
        console.error('Admin login as customer error:', error);
        throw error;
    }
};

// 获取价格列表接口
const getPriceList = async (sync = false) => {
    try {
        const response = await apiClient.get('/payment/price', {
            params: { sync }
        });
        return response.data;
    } catch (error) {
        console.error('获取价格列表错误:', error);
        throw error;
    }
};

// 获取错误记录统计面板接口
const getErrorDashboard = async (params = {}) => {
    try {
        const queryParams = {};
        if (params.customerId) {
            queryParams.customerId = params.customerId;
        }
        if (params.startDate) {
            queryParams.startDate = params.startDate;
        }
        if (params.endDate) {
            queryParams.endDate = params.endDate;
        }
        const response = await apiClient.get('/alternatively/dashboard/errors', { params: queryParams });
        return response.data;
    } catch (error) {
        console.error('Get error dashboard error:', error);
        throw error;
    }
};

// 获取 alternatively 错误记录接口
const getAlternativelyErrors = async (params = {}) => {
    try {
        const response = await apiClient.get('/alternatively/errors', {
            params: {
                websiteId: params.websiteId,
                customerId: params.customerId,
                startTime: params.startTime,
                endTime: params.endTime,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get alternatively errors error:', error);
        throw error;
    }
};

// 获取订阅计数接口
const getSubscriptionCount = async (apiKey) => {
    try {
        const response = await apiClient.get('/events/subscription/count', {
            headers: {
                'api-key': apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get subscription count error:', error);
        throw error;
    }
};

// 新增：获取用户任务统计信息（管理员接口）
const getCustomerStatistic = async () => {
    try {
      const response = await apiClient.get('/admin/customer/statistic');
      return response.data;
    } catch (error) {
      console.error('Failed to get customer statistic:', error);
      return null;
    }
  };

// 新增：获取用户注册统计信息接口
const getCustomerRegisterStatistic = async (params = {}) => {
    try {
        const response = await apiClient.get('/admin/customer/register-statistic', {
            params: {
                startTime: params.startTime,
                endTime: params.endTime
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get customer register statistic error:', error);
        throw error;
    }
};

// 组件分类相关接口 - 使用新的 API 客户端
// 获取组件分类列表
const getComponentCategories = async () => {
    try {
        const response = await componentApiClient.get('/component-categories');
        return response.data;
    } catch (error) {
        console.error('Get component categories error:', error);
        throw error;
    }
};

// 创建组件分类
const createComponentCategory = async (categoryData) => {
    try {
        const response = await componentApiClient.post('/component-categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Create component category error:', error);
        throw error;
    }
};

// 获取单个组件分类
const getComponentCategory = async (categoryId) => {
    try {
        const response = await componentApiClient.get(`/component-categories/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Get component category error:', error);
        throw error;
    }
};

// 更新组件分类
const updateComponentCategory = async (categoryId, categoryData) => {
    try {
        const response = await componentApiClient.put(`/component-categories/${categoryId}`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Update component category error:', error);
        throw error;
    }
};

// 删除组件分类
const deleteComponentCategory = async (categoryId) => {
    try {
        const response = await componentApiClient.delete(`/component-categories/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Delete component category error:', error);
        throw error;
    }
};

// 组件相关接口 - 使用新的 API 客户端
// 获取组件列表
const getComponents = async (params = {}) => {
    try {
        const response = await componentApiClient.get('/components', {
            params: {
                categoryId: params.categoryId,
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get components error:', error);
        throw error;
    }
};

// 创建组件
const createComponent = async (componentData) => {
    try {
        const response = await componentApiClient.post('/components', componentData);
        return response.data;
    } catch (error) {
        console.error('Create component error:', error);
        throw error;
    }
};

// 获取单个组件
const getComponent = async (componentId) => {
    try {
        const response = await componentApiClient.get(`/components/${componentId}`);
        return response.data;
    } catch (error) {
        console.error('Get component error:', error);
        throw error;
    }
};

// 更新组件
const updateComponent = async (componentId, componentData) => {
    try {
        const response = await componentApiClient.put(`/components/${componentId}`, componentData);
        return response.data;
    } catch (error) {
        console.error('Update component error:', error);
        throw error;
    }
};

// 删除组件
const deleteComponent = async (componentId) => {
    try {
        const response = await componentApiClient.delete(`/components/${componentId}`);
        return response.data;
    } catch (error) {
        console.error('Delete component error:', error);
        throw error;
    }
};

// 根据分类获取组件
const getComponentsByCategory = async (categoryId, params = {}) => {
    try {
        const response = await componentApiClient.get(`/components/by-category/${categoryId}`, {
            params: {
                page: params.page,
                limit: params.limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Get components by category error:', error);
        throw error;
    }
};

// 修改导出对象
export const api = {
    login,
    getCustomerList,
    uploadKeywords,
    searchKeywords,
    uploadTopPages,
    getTopPages,
    uploadTopPageKeywords,
    getTopPageKeywords,
    apiClient,
    startAnalysis,
    getPackageFeatures,
    createPackageFeature,
    deletePackageFeature,
    updatePackageFeature,
    applyTrialPackage,
    getTrialPackages,
    deleteTrialPackage,
    updateTrialPackage,
    batchSendEmail,
    getBatchEmailList,
    uploadTableStructure,
    getTableStructures,
    adminLoginAsCustomer,
    getPriceList,
    getErrorDashboard,
    getAlternativelyErrors,
    getSubscriptionCount,
    getCustomerStatistic,
    getCustomerRegisterStatistic,
    // Page Components API 接口 - 使用新的 API 客户端
    getComponentCategories,
    createComponentCategory,
    getComponentCategory,
    updateComponentCategory,
    deleteComponentCategory,
    getComponents,
    createComponent,
    getComponent,
    updateComponent,
    deleteComponent,
    getComponentsByCategory
};