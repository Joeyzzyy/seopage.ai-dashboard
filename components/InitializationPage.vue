<template>
  <div class="initialization-container">
    <!-- Section 1: User Registration Trend -->
    <a-card class="section-card" style="margin-bottom: 32px;">
      <div class="section-header">
        <span class="section-title">User Registration Trend</span>
        <a-select v-model:value="registerStatsDays" style="width: 120px;" @change="updateRegisterChartData">
          <a-select-option :value="30">Last 30 Days</a-select-option>
          <a-select-option :value="90">Last 90 Days</a-select-option>
          <a-select-option :value="0">All</a-select-option>
        </a-select>
      </div>
      <v-chart
        :option="registerChartOption"
        autoresize
        style="height: 400px; margin-top: 16px;"
      />
    </a-card>

    <!-- Section 2: Customer Initialization Table -->
    <a-card class="section-card" style="margin-bottom: 32px;">
      <div class="section-header">
        <span class="section-title">Pending Customer Initialization List</span>
      </div>
      <a-table
        :columns="initializationColumns"
        :data-source="customers"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        :row-class-name="getRowClassName"
        size="small"
        :customRow="customRowHandler"
        :rowSelection="null"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="default" size="small" @click="handleEditPlan(record)">
                Edit Plan
              </a-button>
              <a-button type="primary" size="small" @click="handleLoginAsCustomer(record)">
                Log into WebsiteLM
              </a-button>
              <a-button type="primary" size="small" @click="handleLoginToAltpage(record)">
                Log into Altpage
              </a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'customerId'">
            <span :title="record.customerId">{{ record.customerId }}</span>
          </template>
          <template v-if="column.key === 'email'">
            <span :title="record.email">{{ record.email }}</span>
          </template>
          <template v-if="column.key === 'competeProduct'">
            {{ formatCompeteProducts(record.competeProduct) }}
          </template>
          <template v-if="column.key === 'keywordStatus'">
            <a-tag :color="record.keywordStatus ? 'green' : 'red'">
              {{ record.keywordStatus ? 'Uploaded' : 'Not Uploaded' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Section 3: Data Upload & Analysis -->
    <a-card v-if="selectedCustomerId" class="section-card data-upload-section" style="margin-bottom: 32px;">
      <div class="section-header">
        <span class="section-title">Data Upload & Analysis</span>
        <span class="section-subtitle">Customer Email: {{ selectedCustomer?.email || '' }}</span>
        <a-button
          type="primary"
          :style="{ backgroundColor: '#52c41a', borderColor: '#52c41a' }"
          @click="handleStartAnalysis"
        >
          Complete Data Upload & Start Analysis
        </a-button>
      </div>
      <a-divider />
      <!-- Keyword Upload -->
      <a-card class="sub-section-card" title="SEMrush Keyword Data Upload" :bordered="false">
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
              size="small"
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
      <!-- Competitor Top Pages Upload -->
      <a-card class="sub-section-card" title="Competitor Top Pages Data" :bordered="false" style="margin-top: 24px;">
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
              size="small"
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
    </a-card>

    <!-- Section 4: Keywords Modal -->
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

    <!-- Section 5: Edit Package Modal -->
    <a-modal
      v-model:visible="modalVisible"
      title="Trial Package Details"
      :footer="null"
      width="600px"
    >
      <div v-if="selectedPackage" class="package-form">
        <a-form :model="selectedPackage" layout="vertical">
          <!-- Package Form Content -->
          <a-form-item label="Trial ID">
            <a-input v-model:value="selectedPackage.trialId" disabled />
          </a-form-item>
          <a-form-item label="Trial Name">
            <a-input v-model:value="selectedPackage.trialName" disabled />
          </a-form-item>
          <a-form-item label="Package ID">
            <a-input v-model:value="selectedPackage.packageId" disabled />
          </a-form-item>
          <a-form-item label="Customer ID">
            <a-input v-model:value="selectedPackage.customerId" disabled />
          </a-form-item>
          <a-form-item label="Status">
            <a-tag :color="selectedPackage.active ? 'green' : 'red'">
              {{ selectedPackage.active ? 'Active' : 'Inactive' }}
            </a-tag>
          </a-form-item>
          <a-form-item label="Start Time">
            <a-date-picker
              v-model:value="selectedPackage.startTime"
              :format="'YYYY-MM-DD'"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="End Time">
            <a-date-picker
              v-model:value="selectedPackage.endTime"
              :format="'YYYY-MM-DD'"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="Invite Code">
            <a-input v-model:value="selectedPackage.inviteCode" disabled />
          </a-form-item>
          <a-form-item label="Description">
            <a-textarea v-model:value="selectedPackage.description" disabled />
          </a-form-item>
          <a-form-item label="Duration (Days)">
            <a-input v-model:value="selectedPackage.duration" disabled />
          </a-form-item>
          <a-form-item label="Created At">
            <a-input v-model:value="selectedPackage.createdAt" disabled />
          </a-form-item>
          <a-form-item label="Package">
            <a-select
              v-model:value="selectedPackage.packageFeatureId"
              style="width: 100%"
              placeholder="Select package"
            >
              <a-select-option
                v-for="pkg in packageList"
                :key="pkg.packageFeatureId"
                :value="pkg.packageFeatureId"
              >
                {{ pkg.packageName }} (${{ pkg.packagePrice }})
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :loading="saving" @click="handleSave">
              Save Changes
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div v-else class="no-package-message">
        <a-empty description="No package available for this customer" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { api } from '../api/api'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { 
  UploadOutlined,
  FileAddOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons-vue'
import { Statistic } from 'ant-design-vue'
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const router = useRouter()
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `${total} records in total`,
  showSizeChanger: false,
  showQuickJumper: true,
})

// 初始化页面原有的列定义
const initializationColumns = [
  {
    title: 'Customer ID',
    dataIndex: 'customerId',
    key: 'customerId',
    width: '8%',
    ellipsis: true,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: '15%',
    ellipsis: true,
  },
  {
    title: 'Product Name',
    dataIndex: 'productName',
    key: 'productName',
    width: '15%',
  },
  {
    title: 'Product Website',
    dataIndex: 'productWebsite',
    key: 'productWebsite',
    width: '15%',
  },
  {
    title: 'Competing Products',
    dataIndex: 'competeProduct',
    key: 'competeProduct',
    width: '15%',
  },
  {
    title: 'Compete Product Site',
    dataIndex: 'competeProductSite',
    key: 'competeProductSite',
    width: '15%',
  },
  {
    title: 'Keywords Status',
    dataIndex: 'keywordStatus',
    key: 'keywordStatus',
    width: '15%',
  },
  {
    title: 'Action',
    key: 'action',
    width: '15%',
  },
]

// 客户列表数据
const customers = ref([])
const selectedCustomerId = ref(null)
const selectedCustomer = ref(null)

// 获取行样式
const getRowClassName = (record) => {
  return record.customerId === selectedCustomerId.value ? 'selected-row' : ''
}

// 行选择变化处理
const onSelectChange = (selectedRowKeys) => {
  if (selectedRowKeys.length > 0) {
    selectedCustomerId.value = selectedRowKeys[0]
    selectedCustomer.value = customers.value.find(c => c.customerId === selectedCustomerId.value)
    loadCustomerData(selectedCustomerId.value)
  }
}

// 获取客户列表数据
const fetchCustomerData = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.getCustomerList({
      page: page,
      limit: 10
    })
    customers.value = response.data.map(item => ({
      key: item.customerId,
      id: item.customerId,
      customerId: item.customerId || '-',
      productName: item.productName || '-',
      productWebsite: item.productWebsite || '-',
      competeProduct: item.competeProduct || '-',
      competeProductSite: formatCompeteProductSites(item.competeProduct),
      email: item.email || '-',
      keywordStatus: item.keywordStatus || false
    }))
    
    pagination.value.total = response.TotalCount
    pagination.value.current = page
  } catch (error) {
    console.error('Failed to fetch customer list:', error)
    message.error('Failed to fetch customer list')
  } finally {
    loading.value = false
  }
}

// 处理初始化按钮点击
const handleInitialize = (record) => {
  selectedCustomerId.value = record.customerId
  selectedCustomer.value = record
  loadCustomerData(record.customerId)
}

// 加载客户相关数据
const loadCustomerData = async (customerId) => {
  // 加载所有关键词类型的数据
  for (const type of keywordTypes) {
    await fetchKeywordsData(customerId, type.key)
  }
  
  // 加载竞争对手数据
  const selectedCustomer = customers.value.find(c => c.customerId === customerId)
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

// 添加新的套餐相关状态
const modalVisible = ref(false)
const packageLoading = ref(false)
const packageList = ref([])
const selectedPackage = ref(null)
const saving = ref(false)

// 处理编辑计划按钮点击
const handleEditPlan = async (record) => {
  modalVisible.value = true
  packageLoading.value = true
  try {
    const response = await api.getTrialPackages({
      customerId: record.customerId,
      page: 1,
      limit: 10
    })
    // 检查是否有套餐数据
    if (response.data && response.data.length > 0) {
      const packageData = response.data[0]
      selectedPackage.value = {
        ...packageData,
        startTime: packageData.startTime ? dayjs(packageData.startTime) : null,
        endTime: packageData.endTime ? dayjs(packageData.endTime) : null,
        packageFeatureId: packageData.packageId
      }
    } else {
      selectedPackage.value = null
    }
  } catch (error) {
    console.error('Failed to fetch trial packages:', error)
    message.error('Failed to fetch trial packages')
  } finally {
    packageLoading.value = false
  }
}

// 获取套餐列表
const fetchPackageList = async () => {
  try {
    const response = await api.getPackageFeatures()
    packageList.value = response.data
  } catch (error) {
    console.error('Failed to fetch package list:', error)
    message.error('Failed to get package list')
  }
}

// 保存套餐变更
const handleSave = async () => {
  if (!selectedPackage.value) return
  
  saving.value = true
  try {
    const updateData = {
      startTime: selectedPackage.value.startTime.format('YYYY-MM-DD'),
      endTime: selectedPackage.value.endTime.format('YYYY-MM-DD'),
      packageFeatureId: selectedPackage.value.packageFeatureId
    }
    
    await api.updateTrialPackage(selectedPackage.value.trialId, updateData)
    message.success('Updated successfully')
    modalVisible.value = false
  } catch (error) {
    console.error('Failed to update trial package:', error)
    message.error('Update failed')
  } finally {
    saving.value = false
  }
}

// 格式化竞争产品显示
const formatCompeteProducts = (text) => {
  if (!text) return '-'
  return text.split(',')
    .map(item => item.split('|')[0])
    .join(', ')
}

// 格式化竞争产品网站显示
const formatCompeteProductSites = (text) => {
  if (!text) return '-'
  const sites = text.split(',')
    .map(item => {
      const parts = item.split('|')
      return parts.length > 1 ? parts[1] : ''
    })
    .filter(site => site) // 过滤掉空值
  
  return sites.length > 0 ? sites.join(', ') : '-'
}

// 处理表格分页变化
const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  fetchCustomerData(pag.current)
}

// 以下是从 DataUploadPage 整合的代码

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

// 关键词数据状态
const keywordsLoading = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = false
  return acc
}, {}))

const keywordsData = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = []
  return acc
}, {}))

// 竞争对手相关状态
const competitorsLoading = ref({})
const competitorsData = ref({})
const competitors = ref([])
const activeCompetitorKey = ref('')

// 关键词列定义
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

// 竞争对手列定义
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

// 分页相关状态
const currentPage = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = 1
  return acc
}, {}))

const totalCount = ref(keywordTypes.reduce((acc, type) => {
  acc[type.key] = 0
  return acc
}, {}))

// 获取关键词数据
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

// 获取竞争对手数据
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

// 上传关键词文件前的处理
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

// 上传竞争对手文件前的处理
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

// 处理关键词文件上传
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

// 处理竞争对手文件上传
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

// 处理页面切换
const handlePageChange = async (page, type) => {
  if (selectedCustomerId.value) {
    await fetchKeywordsData(selectedCustomerId.value, type, page)
  }
}

// 关键词模态框相关状态
const isKeywordsModalVisible = ref(false)
const currentTopPageUrl = ref('')
const topPageKeywords = ref([])
const topPageKeywordsLoading = ref(false)

// 顶级页面关键词列定义
const topPageKeywordsColumns = [
  {
    title: 'Keyword',
    dataIndex: 'keyword',
    key: 'keyword',
    width: '200px',
    ellipsis: true,
    fixed: 'left',
  },
  {
    title: 'Pos',
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
    title: 'Vol',
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
    title: 'Organic',
    dataIndex: 'organicTraffic',
    key: 'organicTraffic',
    width: '80px',
    sorter: (a, b) => a.organicTraffic - b.organicTraffic,
  },
  {
    title: 'Paid',
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
      if (record.informational) intents.push('Info');
      if (record.commercial) intents.push('Comm');
      if (record.transactional) intents.push('Trans');
      if (record.navigational) intents.push('Nav');
      if (record.local) intents.push('Local');
      if (record.branded) intents.push('Brand');
      return intents.join(', ');
    }
  },
  {
    title: 'Updated',
    dataIndex: 'updated',
    key: 'updated',
    width: '120px',
  }
]

// 顶级页面关键词分页状态
const topPageKeywordsPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

// 显示关键词模态框
const showKeywordsModal = async (url) => {
  currentTopPageUrl.value = url
  isKeywordsModalVisible.value = true
  await fetchTopPageKeywords(url)
}

// 获取顶级页面关键词
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

// 处理顶级页面关键词表格变化
const handleTopPageKeywordsTableChange = async (pagination) => {
  await fetchTopPageKeywords(currentTopPageUrl.value, pagination.current)
}

// 处理顶级页面关键词上传
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

// 开始分析处理
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

// 在script setup部分添加自定义行处理函数
const customRowHandler = (record) => {
  return {
    onClick: () => {
      selectedCustomerId.value = record.customerId
      selectedCustomer.value = record
      loadCustomerData(record.customerId)
    }
  }
}

// 处理登录客户账号
const handleLoginAsCustomer = async (record) => {
  try {
    const response = await api.adminLoginAsCustomer(record.customerId)
    if (response && response.accessToken) {
      // 清除现有的本地存储数据
      const keysToRemove = [
        'accessToken',
        'intelickIsLoggedIn',
        'currentCustomerEmail',
        'currentCustomerId',
        'rememberedCredentials'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // 设置新的登录信息
      localStorage.setItem('intelickIsLoggedIn', 'true')
      localStorage.setItem('accessToken', response.accessToken)
      
      let customerId = '';
      let customerEmail = '';
      
      if (response.data) {
        customerId = response.data.customerId || '';
        customerEmail = response.data.email || '';
        localStorage.setItem('currentCustomerId', customerId)
        localStorage.setItem('currentCustomerEmail', customerEmail)
      }
      
      // 使用 URL 参数传递 token、customerId 和 customerEmail 进行跳转
      const authUrl = `https://app.websitelm.com/auth?token=${encodeURIComponent(response.accessToken)}&customerId=${encodeURIComponent(customerId)}&customerEmail=${encodeURIComponent(customerEmail)}`;
      
      // 在新标签页中打开链接
      window.open(authUrl, '_blank');
      
      message.success(`Successfully logged in as ${record.productName}`)
    }
  } catch (error) {
    console.error('Failed to login as customer:', error)
    message.error('Failed to login as customer')
  }
}

// 处理登录到Altpage
const handleLoginToAltpage = async (record) => {
  try {
    const response = await api.adminLoginAsCustomer(record.customerId)
    if (response && response.accessToken) {
      // 清除现有的本地存储数据
      const keysToRemove = [
        'alternativelyAccessToken',
        'alternativelyIsLoggedIn',
        'alternativelyCustomerEmail',
        'alternativelyCustomerId'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // 设置新的登录信息
      localStorage.setItem('alternativelyIsLoggedIn', 'true')
      localStorage.setItem('alternativelyAccessToken', response.accessToken)
      
      let customerId = '';
      let customerEmail = '';
      
      if (response.data) {
        customerId = response.data.customerId || '';
        customerEmail = response.data.email || '';
        localStorage.setItem('alternativelyCustomerId', customerId)
        localStorage.setItem('alternativelyCustomerEmail', customerEmail)
      }
      
      // 使用正确的URL格式，不包含auth路径
      const authUrl = `https://altpage.ai/?accessToken=${encodeURIComponent(response.accessToken)}&customerId=${encodeURIComponent(customerId)}&email=${encodeURIComponent(customerEmail)}`;
      
      // 在新标签页中打开链接
      window.open(authUrl, '_blank');
      
      message.success(`Successfully logged in to Altpage as ${record.productName}`)
    }
  } catch (error) {
    console.error('Failed to login to Altpage:', error)
    message.error('Failed to login to Altpage')
  }
}

// 注册用户统计相关状态
const registerStats = ref([]) // 原始数据
const registerStatsDays = ref(30) // 默认30天
const registerChartData = ref([]) // 处理后的折线图数据

const HIGHLIGHT_DATE = '2025-04-15'

const registerChartOption = computed(() => {
  const data = registerChartData.value.map(item => item.count)
  const dateList = registerChartData.value.map(item => item.date)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 40, bottom: 160 },
    xAxis: {
      type: 'category',
      data: dateList,
      boundaryGap: false,
      axisLabel: {
        rotate: 45,
        fontSize: 16,
        fontWeight: 'bold',
        formatter: function (value) {
          if (value === HIGHLIGHT_DATE) {
            return '{highlight|' + value + '}\n{tag|🚀 LAUNCH DAY 🚀}'
          }
          return value
        },
        rich: {
          highlight: {
            fontWeight: 'bold',
            fontSize: 16,
          },
          tag: {
            color: '#ff4d4f',
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: '#fffbe6',
            borderRadius: 6,
            padding: [4, 8, 4, 8],
            lineHeight: 28,
          }
        }
      }
    },
    yAxis: { type: 'value', minInterval: 1, min: 0 },
    series: [
      {
        name: 'Registrations',
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#00c6fb' },
              { offset: 1, color: '#005bea' }
            ]
          }
        },
        itemStyle: {
          color: '#00c6fb',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,198,251,0.3)' },
              { offset: 1, color: 'rgba(0,91,234,0.05)' }
            ]
          }
        }
      }
    ]
  }
})

// 获取注册用户数据
const fetchRegisterStats = async () => {
  try {
    const res = await api.getCustomerList({ page: 1, limit: 500 })
    registerStats.value = (res.data || []).map(item => ({
      registerTime: item.registerTime
    }))
    updateRegisterChartData()
  } catch (e) {
    message.error('Failed to fetch registration stats')
  }
}

// 统计每天注册数
const updateRegisterChartData = () => {
  const days = registerStatsDays.value
  const all = registerStats.value
    .filter(item => !!item.registerTime)
    .map(item => dayjs(item.registerTime).format('YYYY-MM-DD'))
  // 统计
  const countMap = {}
  all.forEach(date => {
    countMap[date] = (countMap[date] || 0) + 1
  })
  // 生成日期序列
  let dateList = []
  if (days === 0) {
    // 全部
    const min = all.length ? dayjs(Math.min(...all.map(d => +new Date(d)))) : dayjs()
    const max = all.length ? dayjs(Math.max(...all.map(d => +new Date(d)))) : dayjs()
    let cur = min
    while (cur.isBefore(max) || cur.isSame(max, 'day')) {
      dateList.push(cur.format('YYYY-MM-DD'))
      cur = cur.add(1, 'day')
    }
  } else {
    // 最近N天
    const end = dayjs()
    const start = end.subtract(days - 1, 'day')
    let cur = start
    while (cur.isBefore(end) || cur.isSame(end, 'day')) {
      dateList.push(cur.format('YYYY-MM-DD'))
      cur = cur.add(1, 'day')
    }
  }
  // 保证HIGHLIGHT_DATE在dateList里
  if (!dateList.includes(HIGHLIGHT_DATE)) {
    dateList.push(HIGHLIGHT_DATE)
    dateList.sort()
  }
  // 组装数据
  registerChartData.value = dateList.map(date => ({
    date,
    count: countMap[date] || 0
  }))
}

// 组件挂载时执行
onMounted(async () => {
  console.log('Component mounted, fetching customer list...')
  await fetchCustomerData()
  await fetchPackageList()
  await fetchRegisterStats()
  
  // 默认选中第一个客户
  if (customers.value.length > 0) {
    selectedCustomerId.value = customers.value[0].customerId
    selectedCustomer.value = customers.value[0]
    loadCustomerData(selectedCustomerId.value)
  }
})
</script>

<style scoped>
.initialization-container {
  padding: 32px 48px;
  background: #f7f9fb;
  min-height: 100vh;
}

.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  background: #fff;
  padding: 24px 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  letter-spacing: 1px;
}

.section-subtitle {
  font-size: 14px;
  color: #888;
  margin-left: 16px;
}

.sub-section-card {
  margin-bottom: 16px;
  border-radius: 8px;
  background: #fafbfc;
  box-shadow: 0 1px 6px rgba(0,0,0,0.03);
  padding: 16px 24px;
}

.data-upload-section {
  border-top: none;
  background: #f5f7fa;
  box-shadow: none;
  padding: 0;
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

:deep(.selected-row) {
  background-color: #e6f7ff;
}

.active-button {
  background-color: #1890ff;
  color: white;
}

:deep(.ant-table-tbody > tr) {
  cursor: pointer;
}
</style>