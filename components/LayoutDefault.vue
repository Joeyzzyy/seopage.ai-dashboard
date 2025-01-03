<template>
  <a-layout class="layout-container">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="260"
      :collapsed-width="80"
      style="background: linear-gradient(180deg, #E9E5FF 0%, #D5CAFF 100%); display: flex; flex-direction: column; box-shadow: 4px 0 10px rgba(0, 0, 0, 0.08);"
    >
      <!-- 折叠按钮 -->
      <div class="collapse-trigger" @click="toggleCollapse">
        <a-button type="text" class="collapse-icon-btn">
          <template v-if="collapsed">
            <RightOutlined style="color: #1890ff;" />
          </template>
          <template v-else>
            <LeftOutlined style="color: #1890ff;" />
          </template>
        </a-button>
      </div>
      
      <!-- 头像部分 -->
      <div class="user-profile-section">
        <a-avatar
          :style="avatarStyle"
          class="user-avatar"
          @click="showUserModal"
        >
          {{ getCurrentUserInitials(selectedUser) }}
        </a-avatar>
        <div class="user-name">{{ getCurrentUserName(selectedUser) }}</div>
      </div>

      <!-- 菜单部分 -->
      <div class="menu-section">
        <a-menu
          mode="inline"
          :selectedKeys="[currentRoute]"
          @click="handleMenuClick"
          class="custom-menu"
        >
          <a-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :class="{ 'nav-item--active': currentRoute === item.path }"
          >
            <template #icon>
              <span class="menu-icon">{{ item.icon }}</span>
            </template>
            {{ item.title }}
          </a-menu-item>
        </a-menu>
      </div>

      <!-- 登出按钮 -->
      <div class="logout-section">
        <a-button type="link" class="logout-btn" @click="handleLogout">
          <LogoutOutlined />
          <span>Logout</span>
        </a-button>
      </div>
    </a-layout-sider>

    <!-- 内容区域 -->
    <a-layout-content class="main-content">
      <router-view></router-view>
    </a-layout-content>
  </a-layout>

  <!-- 用户切换模态框 -->
  <a-modal
    v-model:open="isUserModalVisible"
    title="Switch User"
    @ok="switchUser"
    @cancel="hideUserModal"
    :okButtonProps="{ style: { background: '#1890ff', borderColor: '#1890ff' } }"
    okText="Switch"
    cancelText="Cancel"
  >
    <!-- 用户切换态框的内容 -->
  </a-modal>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LogoutOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

export default {
  name: 'LayoutDefault',
  components: {
    LogoutOutlined,
    RightOutlined,
    LeftOutlined
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const collapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');
    const currentRoute = computed(() => route.path);

    const menuItems = [
      { title: 'Dashboard', path: '/dashboard', icon: '📊' },
      { title: 'Data Upload', path: '/data-upload', icon: '📤' },
    ];

    // 添加获取用户名称的方法
    const getCurrentUserName = (user) => {
      return user?.name || 'User';
    };

    // 添加获取用户首字母的方法
    const getCurrentUserInitials = (user) => {
      if (!user?.name) return 'U';
      return user.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
    };

    // 添加错误处理的方法
    const handleMenuClick = (e) => {
      if (e && e.key) {
        router.push(e.key);
      }
    };

    const toggleCollapse = () => {
      collapsed.value = !collapsed.value;
      localStorage.setItem('sidebarCollapsed', collapsed.value);
    };

    return {
      collapsed,
      currentRoute,
      menuItems,
      getCurrentUserName,
      getCurrentUserInitials,
      selectedUser: ref(null),
      handleMenuClick,
      toggleCollapse,
    };
  }
};
</script>

<style scoped>
.layout-container {
  height: 100%;
  overflow: hidden;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}
</style> 