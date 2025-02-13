<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider 
      :width="200" 
      style="background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); position: fixed; height: 100vh; left: 0; top: 0; z-index: 1000;"
    >
      <div class="sidebar-container">
        <div class="logo">
          <h1>Admin System</h1>
        </div>
        <a-menu
          mode="inline"
          :selectedKeys="[currentView]"
          @click="handleMenuClick"
          style="border-right: 0;"
        >
          <a-menu-item key="InitializationPage">
            <template #icon><setting-outlined /></template>
            Initialization
          </a-menu-item>
          <a-menu-item key="DashboardPage">
            <template #icon><dashboard-outlined /></template>
            Dashboard
          </a-menu-item>
          <a-menu-item key="DataUploadPage">
            <template #icon><upload-outlined /></template>
            Data Upload
          </a-menu-item>
          <a-menu-item key="PackageConfigPage">
            <template #icon><tool-outlined /></template>
            Package Config
          </a-menu-item>
        </a-menu>
        
        <div class="logout-container">
          <a-button 
            type="text" 
            danger 
            block 
            @click="handleLogout"
          >
            <template #icon><logout-outlined /></template>
            Logout
          </a-button>
        </div>
      </div>
    </a-layout-sider>
    
    <!-- 占位 sider -->
    <a-layout-sider :width="200" style="visibility: hidden; background: transparent;" />
    
    <!-- Content Area -->
    <a-layout-content 
      style="padding: 20px; overflow: auto; min-height: 100vh; width: 100%; box-sizing: border-box;"
    >
      <router-view />
    </a-layout-content>
  </a-layout>
  
  <!-- 添加用户切换模态框 -->
  <a-modal
    v-model:open="isUserModalVisible"
    title="Switch User"
    @ok="switchUser"
    @cancel="hideUserModal"
    :okButtonProps="{ 
      style: { 
        background: '#1890ff',
        borderColor: '#1890ff'
      } 
    }"
    okText="Switch"
    cancelText="Cancel"
  >
    <a-radio-group v-model:value="tempSelectedUser" class="user-radio-group">
      <div v-for="user in users" :key="user.userID" class="user-option">
        <a-radio :value="user.userID">
          <div class="user-radio-content">
            <a-avatar :style="getAvatarStyle(user)" class="user-option-avatar">
              {{ getInitials(user.name) }}
            </a-avatar>
            <span class="user-option-name">{{ user.name }}</span>
          </div>
        </a-radio>
      </div>
    </a-radio-group>
  </a-modal>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  SettingOutlined, 
  DashboardOutlined, 
  UploadOutlined, 
  ToolOutlined,
  LogoutOutlined 
} from '@ant-design/icons-vue';
import axios from 'axios';

export default {
  components: {
    SettingOutlined,
    DashboardOutlined,
    UploadOutlined,
    ToolOutlined,
    LogoutOutlined
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentView = ref('DashboardPage');

    // 根据路由路径设置当前视图
    const updateCurrentView = () => {
      const pathMap = {
        '/dashboard': 'DashboardPage',
        '/data-upload': 'DataUploadPage',
        '/initialization': 'InitializationPage',
        '/package-config': 'PackageConfigPage'
      };
      currentView.value = pathMap[route.path] || 'DashboardPage';
    };

    // 组件挂载时更新当前视图
    onMounted(() => {
      updateCurrentView();
    });

    // 监听路由变化
    watch(
      () => route.path,
      () => updateCurrentView()
    );

    // 添加响应拦截器
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // 清除token
          localStorage.removeItem('adminToken');
          // 跳转到登录页
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    return {
      currentView
    };
  },
  data() {
    return {
      isUserModalVisible: false,
      selectedUser: localStorage.getItem('currentUserId'),
      tempSelectedUser: '',
      users: JSON.parse(localStorage.getItem('customers') || '[]'),
    };
  },
  methods: {
    handleMenuClick({ key }) {
      this.currentView = key;
      const routeMap = {
        'DashboardPage': '/dashboard',
        'DataUploadPage': '/data-upload',
        'InitializationPage': '/initialization',
        'PackageConfigPage': '/package-config'
      };
      if (routeMap[key]) {
        this.$router.push(routeMap[key]);
      }
    },
    showUserModal() {
      this.tempSelectedUser = this.selectedUser;
      this.isUserModalVisible = true;
    },
    hideUserModal() {
      this.isUserModalVisible = false;
    },
    async switchUser() {
      if (this.tempSelectedUser !== this.selectedUser) {
        this.selectedUser = this.tempSelectedUser;
        localStorage.setItem('currentUserId', this.selectedUser);
        // Refresh the page to apply new user settings
        window.location.reload();
      }
      this.hideUserModal();
    },
    handleLogout() {
      this.$confirm({
        title: 'Confirm Logout',
        content: 'Are you sure you want to log out?',
        okText: 'Logout',
        cancelText: 'Cancel',
        okButtonProps: {
          danger: true
        },
        onOk: () => {
          localStorage.removeItem('adminToken');
          this.$router.push('/login');
        }
      });
    },
    getCurrentUserName(userId) {
      const user = this.users.find(u => u.userID === userId);
      return user ? user.name : 'User';
    },
    getCurrentUserInitials(userId) {
      return this.getInitials(this.getCurrentUserName(userId));
    },
    getAvatarStyle(user) {
      const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
      const index = user.userID ? parseInt(user.userID) % colors.length : 0;
      return {
        backgroundColor: colors[index]
      };
    },
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
  }
};
</script>

<style scoped>
.ant-layout {
  display: flex;
  width: 100%;
}

.ant-layout-content {
  flex: 1;
}

html, body, #app {
  height: 100%;
  margin: 0;
}

.ant-layout-content {
  padding: 20px;
}

/* 用户模态框相关样式保持不变 */
.user-radio-group {
  width: 100%;
}

.user-option {
  margin: 12px 0;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-option:hover {
  background-color: #f5f5f5;
}

.user-radio-content {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.user-option-avatar {
  margin-right: 12px;
}

.user-option-name {
  font-size: 14px;
  color: #2D2B4A;
}

.sidebar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  background: linear-gradient(180deg, #1a1f3c 0%, #2d3250 100%);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  box-sizing: border-box;
}

:deep(.ant-menu) {
  background: transparent;
  width: 100%;
}

:deep(.ant-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 8px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  width: calc(100% - 24px);
  box-sizing: border-box;
}

:deep(.ant-menu-item:hover) {
  background: linear-gradient(90deg, rgba(82, 190, 255, 0.1), rgba(82, 190, 255, 0.05)) !important;
  color: #52beff;
  transform: translateX(5px);
  box-shadow: 0 0 20px rgba(82, 190, 255, 0.1);
}

:deep(.ant-menu-item.ant-menu-item-selected) {
  background: linear-gradient(90deg, rgba(82, 190, 255, 0.2), rgba(82, 190, 255, 0.1));
  color: #52beff;
  font-weight: 500;
  box-shadow: 0 0 25px rgba(82, 190, 255, 0.15);
  border-left: 3px solid #52beff;
}

:deep(.ant-menu-item .anticon) {
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

:deep(.ant-menu-item:hover .anticon) {
  transform: scale(1.1);
  color: #52beff;
}

.logout-container {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: linear-gradient(135deg, rgba(26, 31, 60, 0.8) 0%, rgba(45, 50, 80, 0.8) 100%);
  width: 100%;
  box-sizing: border-box;
}

.logout-container .ant-btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
  transition: all 0.3s ease;
}

.logout-container .ant-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.3);
  color: #ff4d4f;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 77, 79, 0.2);
}

/* 滚动条样式 */
.sidebar-container::-webkit-scrollbar {
  width: 4px;
}

.sidebar-container::-webkit-scrollbar-thumb {
  background-color: rgba(82, 190, 255, 0.3);
  border-radius: 2px;
}

.sidebar-container::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 添加全局渐变动画 */
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.sidebar-container {
  background-size: 200% 200%;
  animation: gradientAnimation 15s ease infinite;
}

.logo {
  height: 64px;
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #1a1f3c 0%, #2d3250 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(82, 190, 255, 0.5);
}
</style>
