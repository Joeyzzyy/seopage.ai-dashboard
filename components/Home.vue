<template>
  <a-layout style="min-height: 100vh">
    <!-- Mobile top navigation bar -->
    <div v-if="isMobile" class="mobile-header">
      <div class="mobile-header-content">
        <a-button 
          type="text" 
          class="menu-button"
          @click="toggleMobileMenu"
        >
          <MenuOutlined />
        </a-button>
        <div class="mobile-title">
          <span class="title-text">seopage.ai Admin</span>
        </div>
      </div>
    </div>

    <!-- Mobile sidebar overlay -->
    <div 
      v-if="isMobile && mobileMenuVisible" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- Sidebar -->
    <a-layout-sider 
      :width="isMobile ? 300 : 240"
      :class="{
        'desktop-sider': !isMobile,
        'mobile-sider': isMobile,
        'mobile-sider-visible': isMobile && mobileMenuVisible
      }"
    >
      <div class="sidebar-container">
        <a-menu
          mode="inline"
          :selectedKeys="[currentView]"
          @click="handleMenuClick"
          style="border-right: 0;"
        >
          <a-menu-item key="InitializationPage">
            Customer Management
          </a-menu-item>
          <a-menu-item key="PackageConfigPage">
            Package Config
          </a-menu-item>
          <a-menu-item key="EDM">
            Email Marketing
          </a-menu-item>
          <a-menu-item key="ComponentConfig">
            Component Config
          </a-menu-item>
        </a-menu>
        
        <div class="logout-container">
          <a-button 
            type="text" 
            danger 
            block 
            @click="handleLogout"
          >
            Logout
          </a-button>
        </div>
      </div>
    </a-layout-sider>
    
    <!-- Desktop placeholder sider -->
    <a-layout-sider v-if="!isMobile" :width="240" style="visibility: hidden; background: transparent;" />
    
    <!-- Content Area -->
    <a-layout-content 
      :style="{
        padding: isMobile ? '0' : '20px',
        overflow: 'auto',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: isMobile ? '60px' : '0'
      }"
    >
      <router-view />
    </a-layout-content>
  </a-layout>
  
  <!-- User Switch Modal -->
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
    :width="isMobile ? '90%' : '500px'"
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  MenuOutlined
} from '@ant-design/icons-vue';
import axios from 'axios';

export default {
  components: {
    MenuOutlined
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentView = ref('InitializationPage');
    const isMobile = ref(false);
    const mobileMenuVisible = ref(false);

    // 检测设备类型
    const checkDevice = () => {
      const newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile.value) {
        isMobile.value = newIsMobile;
        if (!newIsMobile) {
          mobileMenuVisible.value = false;
        }
      }
    };

    // 切换移动端菜单
    const toggleMobileMenu = () => {
      mobileMenuVisible.value = !mobileMenuVisible.value;
    };

    // 关闭移动端菜单
    const closeMobileMenu = () => {
      mobileMenuVisible.value = false;
    };

    // 根据路由路径设置当前视图
    const updateCurrentView = () => {
      const pathMap = {
        '/initialization': 'InitializationPage',
        '/package-config': 'PackageConfigPage',
        '/edm': 'EDM',
        '/model-config-selection': 'ModelConfigSelection'
      };
      currentView.value = pathMap[route.path] || 'InitializationPage';
    };

    // 组件挂载时更新当前视图
    onMounted(() => {
      checkDevice();
      window.addEventListener('resize', checkDevice);
      updateCurrentView();
    });

    // 清理事件监听器
    onUnmounted(() => {
      window.removeEventListener('resize', checkDevice);
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
      currentView,
      isMobile,
      mobileMenuVisible,
      toggleMobileMenu,
      closeMobileMenu
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
        'InitializationPage': '/initialization',
        'PackageConfigPage': '/package-config',
        'EDM': '/edm',
        'ComponentConfig': '/component-config',
        'ModelConfigSelection': '/model-config-selection'
      };
      if (routeMap[key]) {
        this.$router.push(routeMap[key]);
        // 移动端点击菜单后关闭侧边栏
        if (this.isMobile) {
          this.closeMobileMenu();
        }
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
        content: 'Are you sure you want to logout?',
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
/* 移动端顶部导航栏 */
.mobile-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px 16px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-button {
  color: #495057;
  font-size: 18px;
  padding: 4px;
  border-radius: 6px;
}

.menu-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.mobile-title {
  flex: 1;
  display: flex;
  align-items: center;
}

.title-text {
  color: #495057;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 桌面端侧边栏 */
.desktop-sider {
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 移动端侧边栏 */
.mobile-sider {
  position: fixed !important;
  top: 0;
  left: -300px;
  bottom: 0;
  z-index: 1000;
  transition: left 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.mobile-sider-visible {
  left: 0;
}

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
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
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
  color: #495057;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  width: calc(100% - 24px);
  box-sizing: border-box;
  font-size: 13px;
}

/* 移动端菜单项样式调整 */
@media (max-width: 768px) {
  :deep(.ant-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 4px 8px;
    font-size: 14px;
  }
}

:deep(.ant-menu-item:hover) {
  background: linear-gradient(90deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.05)) !important;
  color: #007bff;
  transform: translateX(5px);
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.1);
}

:deep(.ant-menu-item.ant-menu-item-selected) {
  background: linear-gradient(90deg, rgba(0, 123, 255, 0.2), rgba(0, 123, 255, 0.1));
  color: #007bff;
  font-weight: 500;
  box-shadow: 0 0 25px rgba(0, 123, 255, 0.15);
  border-left: 3px solid #007bff;
}


.logout-container {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.8) 0%, rgba(233, 236, 239, 0.8) 100%);
  width: 100%;
  box-sizing: border-box;
}

.logout-container .ant-btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  color: #dc3545;
  transition: all 0.3s ease;
}

.logout-container .ant-btn:hover {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2);
}

/* 滚动条样式 */
.sidebar-container::-webkit-scrollbar {
  width: 4px;
}

.sidebar-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 123, 255, 0.3);
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


/* 桌面端隐藏移动端元素 */
@media (min-width: 769px) {
  .mobile-header,
  .mobile-overlay {
    display: none;
  }
  
  .mobile-sider {
    position: fixed !important;
    left: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

/* 移动端隐藏桌面端占位元素 */
@media (max-width: 768px) {
  .desktop-sider + .ant-layout-sider {
    display: none;
  }
}
</style>
