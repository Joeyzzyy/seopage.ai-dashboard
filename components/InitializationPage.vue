<template>
  <div class="initialization-container">
    <a-row :gutter="[12, 12]">
      <a-col :span="24">
        <a-card title="Customers Requiring Data Initialization">
          <a-table
            :columns="initializationColumns"
            :data-source="mockData"
            :pagination="{ pageSize: 5 }"
            :loading="loading"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="primary" size="small" @click="handleInitialize(record)">
                  Initialize
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const loading = ref(false)

const initializationColumns = [
  {
    title: 'Customer Name',
    dataIndex: 'productName',
    key: 'productName',
  },
  {
    title: 'Competing Product',
    dataIndex: 'competeProduct',
    key: 'competeProduct',
  },
  {
    title: 'Action',
    key: 'action',
  },
]

// 使用模拟数据
const mockData = [
  {
    key: '1',
    productName: 'Test Product 1',
    competeProduct: 'Competitor A',
  },
  {
    key: '2',
    productName: 'Test Product 2',
    competeProduct: 'Competitor B',
  },
]

const handleInitialize = (record) => {
  message.success(`Initialized ${record.productName}`)
}
</script>

<style scoped>
.initialization-container {
  padding: 24px;
}
</style> 