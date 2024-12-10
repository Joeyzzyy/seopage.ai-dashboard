<template>
  <!-- 完全移除 a-layout 相关组件，直接使用 div -->
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background: #fff;
}

/* 移除所有 Ant Design Layout 相关的默认样式 */
:deep(.ant-layout-sider-trigger) {
  display: none !important;
}

:deep(.ant-layout-sider) {
  display: none !important;
}

:deep(.ant-layout) {
  background: #fff !important;
}
</style>

<script>
export default {
  name: 'App',
};
</script>
