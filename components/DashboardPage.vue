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
                <a-range-picker
                  v-model:value="dateRange"
                  @change="handleDateChange"
                />
                <a-button type="primary" @click="refreshData">
                  Refresh
                </a-button>
              </a-space>
            </div>
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
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <template v-if="selectedCustomer">
      <!-- Core Metrics -->
      <a-row :gutter="[24, 24]" style="margin-top: 16px">
        <!-- Pages Generated Card -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Pages Generated (Last 30 Days)"
              :value="selectedCustomer.monthlyStats.generatedPages"
              :valueStyle="{ color: '#3f8600' }"
            >
              <template #prefix>
                <FileAddOutlined />
              </template>
              <template #suffix>
                <span style="font-size: 12px; margin-left: 8px">
                  +{{ selectedCustomer.monthlyStats.generatedPagesGrowth }}%
                </span>
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Total Cost Card -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Total Cost"
              :value="selectedCustomer.monthlyStats.totalCost"
              :precision="2"
              prefix="$"
              :valueStyle="{ color: '#1890ff' }"
            >
              <template #prefix>
                <DollarOutlined />
              </template>
              <template #suffix>
                <span style="font-size: 12px; margin-left: 8px">
                  {{ selectedCustomer.monthlyStats.costTrend === 'down' ? '-' : '+' }}{{ selectedCustomer.monthlyStats.costChange }}%
                </span>
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Indexing Rate Card -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Indexing Rate"
              :value="selectedCustomer.monthlyStats.indexingRate"
              :precision="1"
              suffix="%"
              :valueStyle="{ color: '#722ed1' }"
            >
              <template #prefix>
                <GlobalOutlined />
              </template>
              <template #suffix>
                <span style="font-size: 12px; margin-left: 8px">
                  +{{ selectedCustomer.monthlyStats.indexingRateGrowth }}%
                </span>
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Token Cost Card -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Avg Token Cost/Page"
              :value="selectedCustomer.monthlyStats.avgTokenCost"
              :precision="0"
              :valueStyle="{ color: selectedCustomer.monthlyStats.tokenCostTrend === 'down' ? '#3f8600' : '#cf1322' }"
            >
              <template #prefix>
                <ThunderboltOutlined />
              </template>
              <template #suffix>
                <span style="font-size: 12px; margin-left: 8px">
                  {{ selectedCustomer.monthlyStats.tokenCostTrend === 'down' ? '-' : '+' }}{{ selectedCustomer.monthlyStats.tokenCostChange }}%
                </span>
              </template>
            </Statistic>
          </a-card>
        </a-col>

        <!-- Keywords Rankings Card -->
        <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <a-card :loading="loading" :bordered="false">
            <Statistic
              title="Keyword Rankings"
              :value="selectedCustomer.monthlyStats.keywordsInTop10"
              suffix="in top 10"
              :valueStyle="{ color: '#1890ff' }"
            >
              <template #prefix>
                <RiseOutlined />
              </template>
              <template #suffix>
                <span style="font-size: 12px; margin-left: 8px">
                  +{{ selectedCustomer.monthlyStats.keywordsGrowth }}%
                </span>
              </template>
            </Statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- Trend Charts -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :span="12">
          <a-card title="Page Generation & Indexing Trend" :loading="loading">
            <div ref="pageChartRef" class="chart-container"></div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="Token Consumption Trend" :loading="loading">
            <div ref="tokenChartRef" class="chart-container"></div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Keyword Performance -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :span="24">
          <a-card title="Keyword Performance" :loading="loading">
            <a-tabs v-model:activeKey="activeTab">
              <a-tab-pane key="ranking" tab="Ranking Distribution">
                <a-table
                  :columns="rankingColumns"
                  :data-source="rankingData"
                  :pagination="false"
                />
              </a-tab-pane>
              <a-tab-pane key="trending" tab="Trending Keywords">
                <a-table
                  :columns="trendingColumns"
                  :data-source="trendingData"
                  :pagination="{ pageSize: 10 }"
                />
              </a-tab-pane>
            </a-tabs>
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
  RiseOutlined,
  DollarOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { Statistic } from 'ant-design-vue'

// State
const loading = ref(false)
const selectedCustomerId = ref(null)
const dateRange = ref([])
const customers = ref([])
const activeTab = ref('ranking')
const pageChartRef = ref(null)
const tokenChartRef = ref(null)
let pageChart = null
let tokenChart = null

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

// Table Columns
const rankingColumns = [
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: 'Keywords Count',
    dataIndex: 'count',
    key: 'count',
  },
  {
    title: 'Change',
    dataIndex: 'change',
    key: 'change',
  }
]

const trendingColumns = [
  {
    title: 'Keyword',
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: 'Current Position',
    dataIndex: 'currentPosition',
    key: 'currentPosition',
  },
  {
    title: 'Position Change',
    dataIndex: 'change',
    key: 'change',
  }
]

// Methods
const initCharts = () => {
  nextTick(() => {
    if (pageChartRef.value) {
      pageChart = echarts.init(pageChartRef.value)
      updatePageChart()
    }
    
    if (tokenChartRef.value) {
      tokenChart = echarts.init(tokenChartRef.value)
      updateTokenChart()
    }
  })
}

const updatePageChart = () => {
  if (!pageChart || !selectedCustomer.value) return
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Generated Pages', 'Indexed Pages']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: selectedCustomer.value.pageData?.dates || []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Generated Pages',
        type: 'line',
        data: selectedCustomer.value.pageData?.generated || [],
        smooth: true,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: 'Indexed Pages',
        type: 'line',
        data: selectedCustomer.value.pageData?.indexed || [],
        smooth: true,
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  }
  
  pageChart.setOption(option)
}

const updateTokenChart = () => {
  if (!tokenChart || !selectedCustomer.value) return
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Token Usage']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: selectedCustomer.value.tokenData?.dates || []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Token Usage',
        type: 'line',
        data: selectedCustomer.value.tokenData?.usage || [],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#722ed1'
        }
      }
    ]
  }
  
  tokenChart.setOption(option)
}

const handleDateChange = (dates) => {
  refreshData()
}

const refreshData = async () => {
  loading.value = true
  try {
    // 获取新数据
    await fetchCustomerData()
    // 更新图表
    nextTick(() => {
      updatePageChart()
      updateTokenChart()
    })
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchCustomerData = async () => {
  loading.value = true
  try {
    customers.value = [
      {
        id: 1,
        name: 'Customer A',
        generatedPages: 1200,
        publishedPages: 1000,
        indexedPages: 900,
        averageTokenPerPage: 2500,
        conversionRate: 15.5,
        monthlyStats: {
          generatedPages: 320,
          generatedPagesGrowth: 15,
          indexingRate: 92.5,
          indexingRateGrowth: 3.2,
          avgTokenCost: 2500,
          tokenCostTrend: 'down',
          tokenCostChange: 8,
          keywordsInTop10: 156,
          keywordsGrowth: 12,
          totalCost: 1250.50,
          costTrend: 'up',
          costChange: 5
        },
        pageData: {
          dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
          generated: [150, 180, 200, 250, 320],
          indexed: [120, 150, 180, 220, 280]
        },
        tokenData: {
          dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
          usage: [2200, 2300, 2400, 2350, 2500]
        }
      },
      {
        id: 2,
        name: 'Customer B',
        generatedPages: 800,
        publishedPages: 700,
        indexedPages: 600,
        averageTokenPerPage: 2300,
        conversionRate: 12.8,
        monthlyStats: {
          generatedPages: 280,
          generatedPagesGrowth: 10,
          indexingRate: 85,
          indexingRateGrowth: 2.5,
          avgTokenCost: 2300,
          tokenCostTrend: 'up',
          tokenCostChange: 3,
          keywordsInTop10: 120,
          keywordsGrowth: 8,
          totalCost: 1250.50,
          costTrend: 'up',
          costChange: 5
        },
        pageData: {
          dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
          generated: [100, 130, 150, 200, 280],
          indexed: [80, 110, 130, 170, 240]
        },
        tokenData: {
          dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
          usage: [2000, 2100, 2200, 2250, 2300]
        }
      }
    ]
    
    if (customers.value.length > 0) {
      selectedCustomerId.value = customers.value[0].id
    }
  } finally {
    loading.value = false
  }
}

// Mock data
const rankingData = ref([
  { position: 'Top 3', count: 156, change: '+12' },
  { position: '4-10', count: 284, change: '+28' },
  { position: '11-20', count: 432, change: '-15' },
  { position: '21-50', count: 621, change: '+41' }
])

const trendingData = ref([
  { keyword: 'example keyword 1', currentPosition: 3, change: '+5' },
  { keyword: 'example keyword 2', currentPosition: 8, change: '+3' },
  { keyword: 'example keyword 3', currentPosition: 12, change: '-2' }
])

const handleResize = () => {
  if (pageChart) pageChart.resize()
  if (tokenChart) tokenChart.resize()
}

// Lifecycle hooks
onMounted(async () => {
  await fetchCustomerData()
  initCharts()
  
  // Handle window resize
  window.addEventListener('resize', () => {
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (pageChart) {
    pageChart.dispose()
    pageChart = null
  }
  if (tokenChart) {
    tokenChart.dispose()
    tokenChart = null
  }
  window.removeEventListener('resize', handleResize)
})

// 监听 selectedCustomer 的变化
watch(selectedCustomer, () => {
  nextTick(() => {
    updatePageChart()
    updateTokenChart()
  })
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