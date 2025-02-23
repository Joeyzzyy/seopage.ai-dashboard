<template>
  <div class="data-upload-container">
    <!-- Customer Selection -->
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card :bordered="false">
          <a-space direction="vertical" size="middle" style="width: 100%">
            <div class="selector-header">
              <h2>Data Upload</h2>
              <div class="header-actions">
                <a-button
                  type="primary"
                  :style="{ backgroundColor: '#52c41a', borderColor: '#52c41a' }"
                  @click="handleStartAnalysis"
                >
                  Complete Data Upload & Start Analysis
                </a-button>
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
                    showTotal: (total) => `${total} records in total`,
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
            <div v-if="competitors.length === 0" class="empty-hint">
              No competitors added
            </div>
            <a-tabs v-else v-model:activeKey="activeCompetitorKey">
              <a-tab-pane 
                v-for="competitor in competitors" 
                :key="competitor.name"
              >
                <template #tab>
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    {{ competitor.name }}
                    <a-badge 
                      v-if="!competitorsData[competitor.url]?.length" 
                      dot 
                      status="error" 
                    />
                  </span>
                </template>
                <div class="upload-section">
                  <a-upload
                    :before-upload="(file) => beforeUploadCompetitors(file, competitor.url)"
                    accept=".csv,.xlsx"
                  >
                    <a-button type="primary">
                      <upload-outlined /> Upload Top Pages for {{ competitor.name }}
                    </a-button>
                  </a-upload>
                </div>

                <!-- Competitors Data Table -->
                <a-table
                  :columns="competitorsColumns"
                  :data-source="competitorsData[competitor.url] || []"
                  :loading="competitorsLoading[competitor.url]"
                  :pagination="{ pageSize: 20 }"
                >
                  <template #emptyText>
                    <div class="empty-hint">
                      No data available. Please upload top pages data for {{ competitor.name }}.
                    </div>
                  </template>
                  <template #actions="{ record }">
                    <a-button type="link" @click="showKeywordsModal(record.URL)">
                      Check Keywords
                    </a-button>
                  </template>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>
    </template>

    <!-- Keywords Modal -->
    <a-modal
      v-model:visible="isKeywordsModalVisible"
      title="Top Page Keywords"
      width="1200px"
      :footer="null"
    >
      <div class="url-display">
        <strong>URL:</strong> {{ currentTopPageUrl }}
      </div>
      
      <div class="upload-section">
        <a-upload
          :before-upload="handleTopPageKeywordsUpload"
          accept=".csv,.xlsx"
        >
          <a-button type="primary">
            <upload-outlined /> Upload Keywords
          </a-button>
        </a-upload>
      </div>

      <a-table
        :columns="topPageKeywordsColumns"
        :data-source="topPageKeywords"
        :loading="topPageKeywordsLoading"
        :pagination="topPageKeywordsPagination"
        @change="handleTopPageKeywordsTableChange"
      >
        <template #emptyText>
          <div class="empty-hint">
            No keywords data available. Please upload keywords file.
          </div>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { api } from '../api/api'
import { useRoute } from 'vue-router'

const route = useRoute()

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
const competitorsLoading = ref({})
const competitorsData = ref({})

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

const competitorsColumns = [
  {
    title: 'URL',
    dataIndex: 'URL',
    key: 'URL',
  },
  {
    title: 'Traffic',
    dataIndex: 'traffic',
    key: 'traffic',
    sorter: (a, b) => a.traffic - b.traffic,
  },
  {
    title: 'Traffic Value',
    dataIndex: 'trafficValue',
    key: 'trafficValue',
    sorter: (a, b) => a.trafficValue - b.trafficValue,
  },
  {
    title: 'Keywords',
    dataIndex: 'keywords',
    key: 'keywords',
    sorter: (a, b) => a.keywords - b.keywords,
  },
  {
    title: 'Top Keyword',
    dataIndex: 'topKeyword',
    key: 'topKeyword',
  },
  {
    title: 'Top Keyword Volume',
    dataIndex: 'topKeywordVolume',
    key: 'topKeywordVolume',
    sorter: (a, b) => a.topKeywordVolume - b.topKeywordVolume,
  },
  {
    title: 'Top Keyword Position',
    dataIndex: 'topKeywordPosition',
    key: 'topKeywordPosition',
    sorter: (a, b) => a.topKeywordPosition - b.topKeywordPosition,
  },
  {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 120,
    slots: {
      customRender: 'actions',
    },
  }
]

// 添加客户相关的状态
const loading = ref(false)
const customers = ref([])
const selectedCustomerId = ref(null)

// 添加竞争对手相关的状态
const competitors = ref([])
const activeCompetitorKey = ref('')

// 获取客户列表
const fetchCustomerList = async () => {
  loading.value = true
  try {
    const response = await api.getCustomerList()
    customers.value = response.data.map(customer => ({
      id: customer.customerId,
      name: customer.productName,
      competeProduct: customer.competeProduct,
      email: customer.email
    }))
    
    // 优先选择 websitelm1.com 客户
    const websitelmCustomer = customers.value.find(customer => customer.name === 'websitelm.com')
    if (websitelmCustomer) {
      selectedCustomerId.value = websitelmCustomer.id
    } else {
      // 如果找不到 websitelm1.com，则按照原来的逻辑处理
      const routeCustomerId = route.query.customerId
      if (routeCustomerId) {
        selectedCustomerId.value = routeCustomerId
      } else {
        // 选择第一个有效的 productName 的客户
        const firstValidCustomer = customers.value.find(customer => customer.name)
        if (firstValidCustomer) {
          selectedCustomerId.value = firstValidCustomer.id
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch customer list:', error)
    message.error('获取客户列表失败')
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
    totalCount.value[type] = response.total || response.totalPage * 10 || 0
    currentPage.value[type] = page
  } catch (error) {
    console.error(`Failed to fetch ${type} keywords:`, error)
    message.error(`Failed to load ${type} keywords data`)
  } finally {
    keywordsLoading.value[type] = false
  }
}

// 合并两个监听器为一个
watch(selectedCustomerId, async (newId) => {
  if (newId) {
    console.log('Customer changed to:', newId)
    
    // 加载所有关键词类型的数据
    for (const type of keywordTypes) {
      await fetchKeywordsData(newId, type.key)
    }
    
    // 加载竞争对手数据
    const selectedCustomer = customers.value.find(c => c.id === newId)
    if (selectedCustomer?.competeProduct) {
      const competitorsList = selectedCustomer.competeProduct.split(',').map(item => {
        const [name, url] = item.split('|')
        return { name, url }
      })
      
      competitors.value = competitorsList
      if (competitorsList.length > 0) {
        activeCompetitorKey.value = competitorsList[0].name
        for (const competitor of competitorsList) {
          try {
            await fetchCompetitorData(competitor.url)
          } catch (error) {
            console.error(`Failed to fetch data for competitor ${competitor.name}:`, error)
          }
        }
      }
    } else {
      competitors.value = []
      activeCompetitorKey.value = ''
    }
  }
})

// 修改 fetchCompetitorData 方法，添加更多日志
const fetchCompetitorData = async (competitorUrl) => {
  console.log(`Starting fetchCompetitorData for URL: ${competitorUrl}`)
  competitorsLoading.value[competitorUrl] = true
  
  try {
    const response = await api.getTopPages({
      customerId: selectedCustomerId.value,
      domainName: competitorUrl,
      page: 1,
      limit: 20
    })
    console.log(`Received data for ${competitorUrl}:`, response)
    competitorsData.value[competitorUrl] = response.data || []
  } catch (error) {
    console.error(`Error fetching data for ${competitorUrl}:`, error)
    competitorsData.value[competitorUrl] = []
  } finally {
    competitorsLoading.value[competitorUrl] = false
  }
}

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

const beforeUploadCompetitors = (file, competitorUrl) => {
  const isValidFormat = file.type === 'text/csv' || 
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  
  if (!isValidFormat) {
    message.error('Please upload CSV or XLSX format files!')
    return false
  }

  handleCompetitorsFile(file, competitorUrl)
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

const handleCompetitorsFile = async (file, competitorUrl) => {
  if (!selectedCustomerId.value) {
    message.error('Please select a customer first')
    return
  }

  competitorsLoading.value[competitorUrl] = true
  try {
    // 从 URL 中提取域名
    const domainName = competitorUrl
    const response = await api.uploadTopPages(file, selectedCustomerId.value, domainName)
    competitorsData.value[competitorUrl] = response.data || []
    message.success(`Top pages data for competitor uploaded successfully!`)
  } catch (error) {
    console.error('Top pages upload failed:', error)
    message.error('File processing failed: ' + (error.response?.data?.message || error.message))
  } finally {
    competitorsLoading.value[competitorUrl] = false
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

// 添加新的状态
const isKeywordsModalVisible = ref(false)
const currentTopPageUrl = ref('')
const topPageKeywords = ref([])
const topPageKeywordsLoading = ref(false)

// 修改 topPageKeywordsColumns 定义，调整列宽并设置固定列
const topPageKeywordsColumns = [
  {
    title: 'Keyword',
    dataIndex: 'keyword',
    key: 'keyword',
    width: '200px',
    ellipsis: true,
    fixed: 'left', // 固定在左侧
  },
  {
    title: 'Pos',  // 缩短标题
    dataIndex: 'currentPosition',
    key: 'currentPosition',
    width: '60px',
    sorter: (a, b) => a.currentPosition - b.currentPosition,
  },
  {
    title: 'URL Inside',
    dataIndex: 'currentURLInside',
    key: 'currentURLInside',
    width: '100px',
    ellipsis: true,
  },
  {
    title: 'Vol',  // 缩短标题
    dataIndex: 'volume',
    key: 'volume',
    width: '70px',
    sorter: (a, b) => a.volume - b.volume,
  },
  {
    title: 'KD',
    dataIndex: 'KD',
    key: 'KD',
    width: '60px',
    sorter: (a, b) => a.KD - b.KD,
  },
  {
    title: 'CPC',
    dataIndex: 'CPC',
    key: 'CPC',
    width: '70px',
    sorter: (a, b) => a.CPC - b.CPC,
  },
  {
    title: 'Organic',  // 缩短标题
    dataIndex: 'organicTraffic',
    key: 'organicTraffic',
    width: '80px',
    sorter: (a, b) => a.organicTraffic - b.organicTraffic,
  },
  {
    title: 'Paid',  // 缩短标题
    dataIndex: 'paidTraffic',
    key: 'paidTraffic',
    width: '70px',
    sorter: (a, b) => a.paidTraffic - b.paidTraffic,
  },
  {
    title: 'SERP Features',
    dataIndex: 'serpFeatures',
    key: 'serpFeatures',
    width: '150px',
    ellipsis: true,
  },
  {
    title: 'Intent',
    key: 'intent',
    width: '150px',
    ellipsis: true,
    customRender: ({ record }) => {
      const intents = [];
      if (record.informational) intents.push('Info');  // 缩短显示文本
      if (record.commercial) intents.push('Comm');
      if (record.transactional) intents.push('Trans');
      if (record.navigational) intents.push('Nav');
      if (record.local) intents.push('Local');
      if (record.branded) intents.push('Brand');
      return intents.join(', ');
    }
  },
  {
    title: 'Updated',  // 缩短标题
    dataIndex: 'updated',
    key: 'updated',
    width: '120px',
  }
]

// 添加新的方法
const showKeywordsModal = async (url) => {
  currentTopPageUrl.value = url
  isKeywordsModalVisible.value = true
  await fetchTopPageKeywords(url)
}

// 添加分页相关的状态
const topPageKeywordsPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

// 修改 fetchTopPageKeywords 方法
const fetchTopPageKeywords = async (url, page = 1) => {
  topPageKeywordsLoading.value = true
  try {
    const response = await api.getTopPageKeywords({
      customerId: selectedCustomerId.value,
      topURL: url,
      page,
      limit: topPageKeywordsPagination.value.pageSize
    })
    topPageKeywords.value = response.data || []
    topPageKeywordsPagination.value = {
      ...topPageKeywordsPagination.value,
      current: page,
      total: response.totalCount || 0
    }
  } catch (error) {
    console.error('Failed to fetch top page keywords:', error)
    message.error('Failed to load keywords data')
  } finally {
    topPageKeywordsLoading.value = false
  }
}

// 添加分页变化处理方法
const handleTopPageKeywordsTableChange = async (pagination) => {
  await fetchTopPageKeywords(currentTopPageUrl.value, pagination.current)
}

const handleTopPageKeywordsUpload = async (file) => {
  if (!selectedCustomerId.value || !currentTopPageUrl.value) {
    message.error('Invalid operation')
    return false
  }

  const isValidFormat = file.type === 'text/csv' || 
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  
  if (!isValidFormat) {
    message.error('Please upload CSV or XLSX format files!')
    return false
  }

  topPageKeywordsLoading.value = true
  try {
    await api.uploadTopPageKeywords(file, selectedCustomerId.value, currentTopPageUrl.value)
    message.success('Keywords uploaded successfully')
    await fetchTopPageKeywords(currentTopPageUrl.value)
  } catch (error) {
    console.error('Failed to upload keywords:', error)
    message.error('Failed to upload keywords')
  } finally {
    topPageKeywordsLoading.value = false
  }
  return false
}

// 添加分析处理方法
const handleStartAnalysis = async () => {
  if (!selectedCustomerId.value) {
    message.error('Please select a customer first');
    return;
  }

  try {
    await api.startAnalysis(selectedCustomerId.value);
    message.success('Analysis started successfully');
    // 可以在这里添加导航到分析页面的逻辑
  } catch (error) {
    message.error('Failed to start analysis: ' + (error.response?.data?.message || error.message));
  }
};

// 简化 onMounted
onMounted(async () => {
  console.log('Component mounted, fetching customer list...')
  await fetchCustomerList()
})
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

.url-display {
  margin-bottom: 16px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  word-break: break-all;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style> 