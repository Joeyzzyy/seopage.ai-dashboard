<template>
  <div class="dashboard-container">
    <!-- Customer Selection -->
    <a-row :gutter="[12, 12]">
      <a-col :span="24">
        <a-card>
          <a-space direction="vertical" size="middle" style="width: 100%">
            <div class="selector-header">
              <h2>Customer Overview</h2>
              <a-space>
                <a-select
                  v-model:value="selectedCustomerId"
                  placeholder="Select a customer"
                  style="width: 200px"
                >
                  <a-select-option
                    v-for="customer in customers"
                    :key="customer.id"
                    :value="customer.id"
                  >
                    {{ customer.name }}
                  </a-select-option>
                </a-select>
                <a-range-picker
                  v-model:value="dateRange"
                  @change="handleDateChange"
                />
                <a-button type="primary" @click="refreshData">
                  Refresh
                </a-button>
              </a-space>
            </div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <template v-if="selectedCustomer">
      <!-- Core Metrics -->
      <a-row :gutter="[24, 24]" style="margin-top: 16px">
        <!-- Generated Pages -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Generated Pages"
              :value="selectedCustomer.monthlyStats.generatedPages"
              :valueStyle="{ color: '#3f8600' }"
            >
              <template #prefix>
                <FileAddOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Published Pages -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Published Pages"
              :value="selectedCustomer.monthlyStats.publishedPages"
              :valueStyle="{ color: '#1890ff' }"
            >
              <template #prefix>
                <GlobalOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Indexed Pages -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Indexed Pages"
              :value="selectedCustomer.monthlyStats.indexedPages"
              :valueStyle="{ color: '#722ed1' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Indexing Rate -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Indexing Rate"
              :value="selectedCustomer.monthlyStats.indexingRate"
              :precision="2"
              suffix="%"
              :valueStyle="{ color: '#1890ff' }"
            >
              <template #prefix>
                <PercentageOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Total Token Usage -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Total Token Usage"
              :value="selectedCustomer.monthlyStats.totalTokens"
              :valueStyle="{ color: '#faad14' }"
            >
              <template #prefix>
                <ThunderboltOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Total Token Cost -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Total Token Cost"
              :value="selectedCustomer.monthlyStats.totalTokenCost"
              :precision="2"
              prefix="$"
              :valueStyle="{ color: '#cf1322' }"
            >
              <template #prefix>
                <DollarOutlined />
              </template>
            </Statistic>
          </a-card>
        </a-col>
      </a-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  FileAddOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PercentageOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { Statistic } from 'ant-design-vue'
import { api } from '../api/api';

// State
const loading = ref(false)
const selectedCustomerId = ref(null)
const dateRange = ref([])
const customers = ref([])

// Computed
const selectedCustomer = computed(() => 
  customers.value.find(c => c.id === selectedCustomerId.value)
)

const coreMetrics = computed(() => {
  if (!selectedCustomer.value) return []
  
  return [
    {
      key: 'total-pages',
      title: 'Total Generated Pages',
      value: selectedCustomer.value.generatedPages,
      trend: 'up',
      percentage: 15,
      color: '#3f8600'
    },
    {
      key: 'indexing-rate',
      title: 'Indexing Rate',
      value: (selectedCustomer.value.indexedPages / selectedCustomer.value.publishedPages * 100),
      precision: 1,
      suffix: '%',
      trend: 'up',
      percentage: 5,
      color: '#3f8600'
    },
    {
      key: 'avg-tokens',
      title: 'Avg Token Usage',
      value: selectedCustomer.value.averageTokenPerPage,
      trend: 'down',
      percentage: 8,
      color: '#cf1322'
    },
    {
      key: 'conversion-rate',
      title: 'Page Conversion Rate',
      value: selectedCustomer.value.conversionRate,
      precision: 1,
      suffix: '%',
      trend: 'up',
      percentage: 12,
      color: '#3f8600'
    }
  ]
})

// Methods
const handleDateChange = (dates) => {
  refreshData()
}

const refreshData = async () => {
  loading.value = true
  try {
    // 只保留获取数据的部分
    await fetchCustomerData()
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchCustomerData = async () => {
  loading.value = true
  try {
    const response = await api.getCustomerList()
    
    customers.value = Object.entries(response.data).map(([id, name]) => ({
      id,
      name,
      monthlyStats: {
        generatedPages: 0,
        publishedPages: 0,
        indexedPages: 0,
        indexingRate: 0,
        totalTokens: 0,
        totalTokenCost: 0
      }
    }))
    
    if (customers.value.length > 0) {
      selectedCustomerId.value = customers.value[0].id
    }
  } catch (error) {
    console.error('获取客户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchCustomerData()
})

onUnmounted(() => {
  // 清理代码已移除
})

// 监听 selectedCustomer 的变化
watch(selectedCustomer, () => {
  // 移除对图表的更新
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  padding: 24px;
}

.ant-card {
  height: 100%;
  border-radius: 8px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
}
</style>