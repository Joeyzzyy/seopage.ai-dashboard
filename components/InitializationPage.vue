<template>
  <div class="initialization-container">
    <a-row :gutter="[12, 12]">
      <a-col :span="24">
        <a-card title="Customers Requiring Data Initialization">
          <a-table
            :columns="initializationColumns"
            :data-source="customers"
            :pagination="{ pageSize: 5 }"
            :loading="loading"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button type="primary" size="small" @click="handleInitialize(record)">
                  Initialize
                </a-button>
              </template>
              <template v-if="column.key === 'competeProduct'">
                {{ formatCompeteProducts(record.competeProduct) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { api } from '../api/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const initializationColumns = [
  {
    title: 'Customer Name',
    dataIndex: 'productName',
    key: 'productName',
  },
  {
    title: 'Competing Products',
    dataIndex: 'competeProduct',
    key: 'competeProduct',
  },
  {
    title: 'Action',
    key: 'action',
  },
]

// Replace mock data with actual data
const customers = ref([])

// Fetch customer list data
const fetchCustomerData = async () => {
  loading.value = true
  try {
    const response = await api.getCustomerList()
    customers.value = Object.entries(response.data).map(([id, data]) => ({
      key: id,
      id,
      productName: data.productName,
      competeProduct: data.competeProduct || '-'
    }))
  } catch (error) {
    console.error('Failed to fetch customer list:', error)
    message.error('Failed to fetch customer list')
  } finally {
    loading.value = false
  }
}

const handleInitialize = (record) => {
  router.push({
    name: 'DataUpload',
    query: { 
      customerId: record.id,
      customerName: record.productName  // 额外传递客户名称
    }
  })
}

const formatCompeteProducts = (text) => {
  if (!text) return '-'
  return text.split(',')
    .map(item => item.split('|')[0])
    .join(', ')
}

onMounted(() => {
  fetchCustomerData()
})
</script>

<style scoped>
.initialization-container {
  padding: 24px;
}
</style> 