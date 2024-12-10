<template>
  <a-layout style="height: 100vh; background: #f0f2f5;">
    <a-layout-content
      style="display: flex; align-items: center; justify-content: center; height: 100%;"
    >
      <div
        style="width: 360px; padding: 32px; background: #fff; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
      >
        <h2 style="text-align: center; margin-bottom: 24px;">
          Admin Console
        </h2>
        
        <a-form layout="vertical" @submit.prevent="handleLogin">
          <a-form-item label="Username">
            <a-input 
              v-model:value="form.username" 
              placeholder="Username" 
              @keydown.enter="handleLogin"
            />
          </a-form-item>
          <a-form-item label="Password">
            <a-input-password 
              v-model:value="form.password" 
              placeholder="Password" 
              @keydown.enter="handleLogin"
            />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="rememberMe">Remember me</a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button 
              type="primary" 
              block 
              @click="handleLogin" 
              :loading="loading"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script>
import apiClient from '../api/api';

export default {
  name: 'LoginPage',
  data() {
    if (localStorage.getItem('intelickIsLoggedIn')) {
      this.$router.push('/');
    }
    return {
      form: {
        username: '',
        password: ''
      },
      rememberMe: false,
      loading: false
    };
  },
  created() {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const decoded = this.decodeCredentials(savedCredentials);
      this.form.username = decoded.username;
      this.form.password = decoded.password;
      this.rememberMe = true;
    }
  },
  methods: {
    encodeCredentials(credentials) {
      return btoa(JSON.stringify(credentials));
    },
    decodeCredentials(encoded) {
      return JSON.parse(atob(encoded));
    },
    async handleLogin() {
      const { username, password } = this.form;
      if (!username || !password) {
        this.$notification.error({
          message: 'Login Error',
          description: 'Please enter username and password'
        });
        return;
      }

      this.loading = true;
      try {
        const response = await apiClient.login(username, password);
        if (response) {
          // Clear all old data
          localStorage.clear();
          
          // Store only necessary login information
          localStorage.setItem('intelickIsLoggedIn', 'true');
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('customers', JSON.stringify(response.customers));
          
          if (response.customers?.[0]) {
            localStorage.setItem('currentCustomer', JSON.stringify(response.customers[0]));
            localStorage.setItem('currentUserId', response.customers[0].customerId);
          }
          
          // Remember password functionality
          if (this.rememberMe) {
            const credentials = { username, password };
            localStorage.setItem('rememberedCredentials', this.encodeCredentials(credentials));
          }
          
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Login failed:', error);
        this.$notification.error({
          message: 'Login Failed',
          description: error.response?.data?.message || 'Please check your username and password'
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.ant-input, .ant-input-password {
  height: 32px;
}

.ant-btn {
  height: 32px;
}
</style>
