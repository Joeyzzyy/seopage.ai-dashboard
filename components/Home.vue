<template>
  <a-layout style="height: 100vh;">
    <a-layout-sider :width="150" style="background: #fff">
      <div style="padding-top: 20px; font-size: 13px;">
        <a-menu
          mode="inline"
          :selectedKeys="[currentView]"
          @click="handleMenuClick"
          style="font-size: 13px;"
        >
          <a-menu-item key="DashboardPage">
            Dashboard
          </a-menu-item>
          <a-menu-item key="DataUploadPage">
            Data Upload
          </a-menu-item>
        </a-menu>
      </div>
    </a-layout-sider>
    <!-- 内容区域 -->
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';

export default {
  components: {
    LeftOutlined,
    RightOutlined,
  },
  setup() {
    const currentView = ref('DashboardPage');
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
  computed: {
    selectedCustomer() {
      return this.customers.find(customer => customer.id === this.selectedCustomerId);
    }
  },
  mounted() {
    this.fetchCustomerData();
  },
  methods: {
    fetchCustomerData() {
      // Simulate API call with mock data
      this.customers = [
        {
          id: 1,
          name: 'Customer A',
          generatedPages: 120,
          publishedPages: 100,
          deletedPages: 20,
          currentPageStock: 80,
          tokenConsumptionMedian: 50,
          indexedPages: 90
        },
        {
          id: 2,
          name: 'Customer B',
          generatedPages: 200,
          publishedPages: 180,
          deletedPages: 20,
          currentPageStock: 160,
          tokenConsumptionMedian: 45,
          indexedPages: 170
        }
      ];
    },
    handleMenuClick({ key }) {
      this.currentView = key;
      const routeMap = {
        'DashboardPage': '/dashboard',
        'DataUploadPage': '/data-upload'
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('intelickIsLoggedIn');
      localStorage.removeItem('customers');
      localStorage.removeItem('currentUserId');
      this.$router.push('/login');
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
</style>
