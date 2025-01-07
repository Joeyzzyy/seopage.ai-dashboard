<template>
  <div class="data-upload-container">
    <!-- Customer Selection -->
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card :bordered="false">
          <a-space direction="vertical" size="middle" style="width: 100%">
            <div class="selector-header">
              <h2>Data Upload</h2>
              <a-select
                v-model:value="selectedCustomerId"
                placeholder="Select a customer"
                style="width: 200px"
                :loading="loading"
              >
                <a-select-option
                  v-for="customer in customers"
                  :key="customer.id"
                  :value="customer.id"
                >
                  {{ customer.name }}
                </a-select-option>
              </a-select>
            </div>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- Only show upload sections when a customer is selected -->
    <template v-if="selectedCustomerId">
      <!-- SEMrush Keywords Data Section -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :span="24">
          <a-card title="SEMrush Keywords Data Upload" :bordered="false">
            <!-- Keywords Type Tabs -->
            <a-tabs v-model:activeKey="activeKeywordsType">
              <a-tab-pane v-for="type in keywordTypes" :key="type.key">
                <template #tab>
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    {{ type.label }}
                    <a-badge v-if="!keywordsData[type.key]?.length" dot status="error" />
                  </span>
                </template>
                <div class="upload-section">
                  <a-upload
                    :before-upload="(file) => beforeUploadKeywords(file, type.key)"
                    accept=".csv,.xlsx"
                  >
                    <a-button type="primary">
                      <upload-outlined /> Upload {{ type.label }} Keywords
                    </a-button>
                  </a-upload>
                  <a-tag v-if="keywordsData[type.key]?.length" color="success">
                    {{ keywordsData[type.key].length }} rows uploaded
                  </a-tag>
                </div>
                
                <!-- Keywords Data Table -->
                <a-table
                  :columns="keywordsColumns"
                  :data-source="keywordsData[type.key]"
                  :loading="keywordsLoading[type.key]"
                  :pagination="{
                    total: totalCount[type.key],
                    current: currentPage[type.key],
                    pageSize: 10,
                    showSizeChanger: false,
                    onChange: (page) => handlePageChange(page, type.key)
                  }"
                >
                  <template #emptyText>
                    <div class="empty-hint">
                      No data available. Please upload {{ type.label }} keywords file.
                    </div>
                  </template>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>

      <!-- Competitors Top Pages Section -->
      <a-row :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :span="24">
          <a-card title="Competitors Top Pages Data" :bordered="false">
            <template #extra>
              <a-upload
                :before-upload="beforeUploadCompetitors"
                accept=".csv,.xlsx"
              >
                <a-button type="primary">
                  <upload-outlined /> Upload Excel/CSV
                </a-button>
              </a-upload>
            </template>
            
            <!-- Competitors Data Table -->
            <a-table
              :columns="competitorsColumns"
              :data-source="competitorsData"
              :loading="competitorsLoading"
              :pagination="{ pageSize: 10 }"
            >
              <template #emptyText>
                <div class="empty-hint">
                  No data available. Please upload a competitors data file.
                </div>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { api } from '../api/api';

// Keywords types configuration
const keywordTypes = [
  { key: 'common', label: 'Common Keywords' },
  { key: 'absence', label: 'Absence Keywords' },
  { key: 'weak', label: 'Weak Keywords' },
  { key: 'strong', label: 'Strong Keywords' },
  { key: 'undeveloped', label: 'Undeveloped Keywords' },
  { key: 'unique', label: 'Unique Keywords' },
  { key: 'all', label: 'All Keywords' },
]

const activeKeywordsType = ref('common')

// Modified states
const keywordsLoading = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = false
  return acc
}, {}))

const keywordsData = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = []
  return acc
}, {}))

// States
const competitorsLoading = ref(false)
const competitorsData = ref([])

// Remove columns definitions
const keywordsColumns = [
  {
    title: 'Keyword',
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: 'Intent',
    dataIndex: 'intent',
    key: 'intent',
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    key: 'volume',
    sorter: (a, b) => a.volume - b.volume,
  },
  {
    title: 'Keyword Difficulty',
    dataIndex: 'keyword_difficulty',
    key: 'keyword_difficulty',
    sorter: (a, b) => a.keyword_difficulty - b.keyword_difficulty,
  },
  {
    title: 'CPC',
    dataIndex: 'cpc',
    key: 'cpc',
    sorter: (a, b) => a.cpc - b.cpc,
  },
  {
    title: 'Competition Density',
    dataIndex: 'competition_density',
    key: 'competition_density',
    sorter: (a, b) => a.competition_density - b.competition_density,
  }
]

const competitorsColumns = []

// 添加客户相关的状态
const loading = ref(false)
const customers = ref([])
const selectedCustomerId = ref(null)

// 获取客户列表
const fetchCustomerList = async () => {
  loading.value = true
  try {
    const response = await api.getCustomerList()
    customers.value = Object.entries(response.data).map(([id, name]) => ({
      id,
      name
    }))
    
    // 移除这里的默认选择，改为通过 watch 处理
    if (customers.value.length > 0 && !selectedCustomerId.value) {
      selectedCustomerId.value = customers.value[0].id
    }
  } catch (error) {
    console.error('Failed to fetch customer list:', error)
    message.error('Failed to load customer list')
  } finally {
    loading.value = false
  }
}

// 修改 script setup 部分
const fetchKeywordsData = async (customerId, type, page = 1) => {
  keywordsLoading.value[type] = true
  try {
    const response = await api.searchKeywords({
      customerId,
      keywordType: type,
      page,
      limit: 10
    })
    keywordsData.value[type] = response.data || []
    totalCount.value[type] = response.totalCount || 0
    currentPage.value[type] = page
  } catch (error) {
    console.error(`Failed to fetch ${type} keywords:`, error)
    message.error(`Failed to load ${type} keywords data`)
  } finally {
    keywordsLoading.value[type] = false
  }
}

// 添加监听器来处理客户选择变更
watch(selectedCustomerId, async (newCustomerId) => {
  if (newCustomerId) {
    for (const type of keywordTypes) {
      await fetchKeywordsData(newCustomerId, type.key)
    }
  }
})

// 修改 onMounted
onMounted(async () => {
  await fetchCustomerList()
  // 移除这里的数据加载，完全依赖 watch 来处理
})

// Modified upload handler
const beforeUploadKeywords = (file, type) => {
  const isValidFormat = file.type === 'text/csv' || 
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  
  if (!isValidFormat) {
    message.error('Please upload CSV or XLSX format files!')
    return false
  }

  handleKeywordsFile(file, type)
  return false
}

const beforeUploadCompetitors = (file) => {
  const isValidFormat = file.type === 'text/csv' || 
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  
  if (!isValidFormat) {
    message.error('Please upload CSV or XLSX format files!')
    return false
  }

  // 这里添加文件处理逻辑
  handleCompetitorsFile(file)
  return false
}

// Modified file handler
const handleKeywordsFile = async (file, type) => {
  if (!selectedCustomerId.value) {
    message.error('Please select a customer first')
    return
  }

  keywordsLoading.value[type] = true
  try {
    // Set timeout to 30 seconds
    const response = await api.uploadKeywords(file, selectedCustomerId.value, type, { timeout: 30000 })
    
    keywordsData.value[type] = response.data || []
    message.success(`${type} keywords data uploaded successfully!`)
  } catch (error) {
    console.error('Keywords upload failed:', error)
    message.error('File processing failed: ' + (error.response?.data?.message || error.message))
  } finally {
    keywordsLoading.value[type] = false
  }
}

const handleCompetitorsFile = async (file) => {
  if (!selectedCustomerId.value) {
    message.error('Please select a customer first')
    return
  }

  competitorsLoading.value = true
  try {
    // 这里添加文件解析和数据处理逻辑
    // 可以将 selectedCustomerId.value 传递给后端
    message.success('Competitors data uploaded successfully!')
  } catch (error) {
    message.error('File processing failed: ' + error.message)
  } finally {
    competitorsLoading.value = false
  }
}

// 下载模板函数
const downloadKeywordsTemplate = null
const downloadCompetitorsTemplate = null

// 在 script setup 中添加分页相关的状态和方法
const currentPage = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = 1
  return acc
}, {}))

const totalCount = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = 0
  return acc
}, {}))

// 添加页面切换处理方法
const handlePageChange = async (page, type) => {
  if (selectedCustomerId.value) {
    await fetchKeywordsData(selectedCustomerId.value, type, page)
  }
}
</script>

<style scoped>
.data-upload-container {
  padding: 24px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.upload-section {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.empty-hint {
  text-align: center;
  padding: 24px;
  color: #999;
}

.ant-card {
  border-radius: 8px;
}
</style> 