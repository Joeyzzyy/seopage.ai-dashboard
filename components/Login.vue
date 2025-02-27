<template>
  <div class="login-container">
    <a-form
      :model="formState"
      @finish="handleSubmit"
      class="login-form"
    >
      <h2 style="text-align: center; margin-bottom: 24px;">System Login</h2>
      
      <a-form-item
        name="username"
        :rules="[{ required: true, message: 'Please input your username' }]"
      >
        <a-input v-model:value="formState.username" placeholder="Username">
          <template #prefix>
            <UserOutlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[{ required: true, message: 'Please input your password' }]"
      >
        <a-input-password v-model:value="formState.password" placeholder="Password">
          <template #prefix>
            <LockOutlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
      </a-form-item>

      <a-button
        type="primary"
        html-type="submit"
        class="login-form-button"
        :loading="loading"
      >
        Login
      </a-button>
    </a-form>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, onMounted } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { api } from '../api/api';

export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const formState = reactive({
      username: '',
      password: '',
      remember: false
    });

    onMounted(() => {
      const savedUsername = localStorage.getItem('username');
      const savedPassword = localStorage.getItem('password');
      if (savedUsername && savedPassword) {
        formState.username = savedUsername;
        formState.password = savedPassword;
        formState.remember = true;
      }
    });

    const handleSubmit = async () => {
      loading.value = true;
      try {
        const result = await api.login(formState.username, formState.password);
        if (result?.code === 200) {
          localStorage.setItem('adminaccesstoken', result.accessToken);
          
          if (formState.remember) {
            localStorage.setItem('username', formState.username);
            localStorage.setItem('password', formState.password);
          } else {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
          }

          message.success('Login successful');
          await router.push('/initialization');
        } else if (result?.code === 1049) {
          message.error('Incorrect password, please try again');
        } else {
          message.error('Login failed, please check your credentials');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response?.data?.code === 1049) {
          message.error('Incorrect password, please try again');
        } else {
          message.error(`Login error: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      formState,
      loading,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-form {
  width: 300px;
  padding: 24px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.login-form-button {
  width: 100%;
}
</style> 