<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider 
      :width="200" 
      style="background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);"
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
    <!-- Content Area -->
    <a-layout-content style="padding: 20px; overflow: auto; height: calc(100% - 20px);">
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.logo h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.logout-container {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

:deep(.ant-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
}

:deep(.ant-menu-item .anticon) {
  font-size: 16px;
}
</style>
