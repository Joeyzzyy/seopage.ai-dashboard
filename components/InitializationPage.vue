<template>
  <div class="initialization-container">
    <!-- System Overview Dashboard & User Registration Trend -->
    <a-card class="section-card">
      <div class="section-header">
        <div class="section-title-mobile">
          <span class="section-title">System Overview Dashboard</span>
        </div>
        <div class="header-actions-mobile">
          <a-select v-model:value="registerStatsDays" class="mobile-select" @change="updateRegisterChartData">
            <a-select-option :value="30">Last 30 Days</a-select-option>
            <a-select-option :value="90">Last 90 Days</a-select-option>
            <a-select-option :value="0">All Time</a-select-option>
          </a-select>
        </div>
      </div>
      <a-spin :spinning="customerStatisticLoading" tip="Loading...">
        <div v-if="customerStatisticData" class="dashboard-stats">
          <!-- System Stats -->
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-label">Total Registered Users</div>
              <div class="stat-value">{{ formatStatisticValue(totalRegistrations) }}</div>
            </div>
            
            <div class="stat-item highlight">
              <div class="stat-label">Unsubscribed Users (No Tasks)</div>
              <div class="stat-value">{{ formatStatisticValue(customerStatisticData?.data?.unsubscribedNoTask) }}</div>
              <div class="stat-percentage">
                {{ calculatePercentage(customerStatisticData?.data?.unsubscribedNoTask, totalRegistrations) }}
                <span class="percentage-formula">(No Tasks / Total Users)</span>
              </div>
            </div>
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-label">Unsubscribed Users (With Tasks)</div>
              <div class="stat-value">{{ formatStatisticValue(customerStatisticData?.data?.unsubscribeTaskOne) }}</div>
              <div class="stat-percentage">
                {{ calculatePercentage(customerStatisticData?.data?.unsubscribeTaskOne, totalRegistrations) }}
                <span class="percentage-formula">(With Tasks / Total Users)</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">Unsubscribed Users (With Pages)</div>
              <div class="stat-value">{{ formatStatisticValue(customerStatisticData?.data?.unsubscribeDeployOne) }}</div>
              <div class="stat-percentage">
                {{ calculatePercentage(customerStatisticData?.data?.unsubscribeDeployOne, totalRegistrations) }}
                <span class="percentage-formula">(With Pages / Total Users)</span>
              </div>
            </div>
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-label">Task Activation Rate</div>
              <div class="stat-value">{{ formatStatisticValue(customerStatisticData?.data?.unsubscribeTaskOne) }} / {{ formatStatisticValue(totalRegistrations) }}</div>
              <div class="stat-percentage">
                {{ calculateConversionRate(customerStatisticData?.data?.unsubscribeTaskOne, totalRegistrations) }}
                <span class="percentage-formula">(Users with Tasks / Total Users)</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">Page Deployment Conversion</div>
              <div class="stat-value">{{ formatStatisticValue(customerStatisticData?.data?.unsubscribeDeployOne) }} / {{ formatStatisticValue(customerStatisticData?.data?.unsubscribeTaskOne) }}</div>
              <div class="stat-percentage">
                {{ calculateConversionRate(customerStatisticData?.data?.unsubscribeDeployOne, customerStatisticData?.data?.unsubscribeTaskOne) }}
                <span class="percentage-formula">(Users with Pages / Users with Tasks)</span>
              </div>
            </div>
          </div>

          <!-- Registration Statistics Section -->
          <div class="registration-stats-section">
            <div class="section-subtitle">Registration Statistics</div>
            <div class="register-summary-stats-flat">
              <div class="register-summary-item-flat">
                <div class="summary-value-large">{{ formatStatisticValue(todayRegistrations) }}</div>
                <div class="summary-label-large">Today's New Registrations</div>
              </div>
              <div class="register-summary-item-flat">
                <div class="summary-value-large">{{ formatStatisticValue(yesterdayRegistrations) }}</div>
                <div class="summary-label-large">Yesterday's New Registrations</div>
              </div>
              <div class="register-summary-item-flat">
                <div class="summary-value-large">{{ formatStatisticValue(last7DaysRegistrations) }}</div>
                <div class="summary-label-large">New Registrations (Last 7 Days)</div>
              </div>
              <div class="register-summary-item-flat">
                <div class="summary-value-large">{{ formatStatisticValue(last15DaysRegistrations) }}</div>
                <div class="summary-label-large">New Registrations (Last 15 Days)</div>
              </div>
            </div>
          </div>

          <!-- Registration Trend Chart -->
          <div class="chart-container">
            <div class="section-subtitle">Registration Trend</div>
            <v-chart
              :option="registerChartOption"
              autoresize
              class="mobile-chart"
            />
          </div>
        </div>
        <div v-else class="empty-container">
          <a-empty description="No data available" />
        </div>
      </a-spin>
    </a-card>

    <!-- Customer Management -->
    <a-card class="section-card">
      <div class="section-header">
        <span class="section-title">Customer Management</span>
        <!-- Remove wrapper container to let filters take full width -->
        <div class="filter-container">
          <div class="filter-header">
            <div class="filter-title-section">
              <span class="filter-title">
                <FilterOutlined />
                Filters
              </span>
              <!-- Search box moved to the right of filter conditions -->
              <div class="header-search-section">
                <a-input-search
                  v-model:value="searchEmail"
                  placeholder="Search Email"
                  class="header-search-input"
                  @search="handleSearch"
                  @change="handleSearchChange"
                  allowClear
                  size="small"
                />
                <!-- Record count also moved here -->
                <div class="header-customer-stats">
                  <span class="stats-text">
                    Total: <span class="stats-number">{{ pagination.total }}</span> records
                  </span>
                  <span class="stats-text" v-if="pagination.total > 0">
                    Page: <span class="stats-number">{{ pagination.current }}</span>/{{ Math.ceil(pagination.total / pagination.pageSize) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="filter-header-actions">
              <a-button size="small" @click="clearFilters" :disabled="!hasActiveFilters">
                Clear
              </a-button>
              <a-button 
                type="primary" 
                size="small" 
                @click="applyFilters"
                :loading="loading"
              >
                Apply
              </a-button>
            </div>
          </div>
          
          <div class="filter-content">
            <!-- Subscription Status Filter -->
            <div class="filter-group">
              <div class="filter-group-header">
                <div class="filter-group-title">Subscription Status</div>
              </div>
              <div class="filter-group-content">
                <a-radio-group v-model:value="subscribeFilter" @change="handleFilterChange">
                  <a-radio :value="true">Show Unsubscribed Users Only</a-radio>
                  <a-radio :value="false">Show Subscribed Users Only</a-radio>
                </a-radio-group>
              </div>
            </div>

            <!-- Domain Binding Filter -->
            <div class="filter-group">
              <div class="filter-group-header">
                <a-checkbox 
                  v-model:checked="domainBindFilter" 
                  @change="handleFilterChange"
                  class="filter-checkbox"
                >
                  <span class="filter-group-title">Domain Binding Filter</span>
                </a-checkbox>
              </div>
              <div class="filter-group-content" :class="{ disabled: !domainBindFilter }">
                <div class="filter-description">
                  <span class="description-text">Show users with completed domain binding only</span>
                </div>
              </div>
            </div>

            <!-- Task Count Filter -->
            <div class="filter-group">
              <div class="filter-group-header">
                <a-checkbox 
                  v-model:checked="enableWebsiteCountFilter" 
                  @change="handleFilterChange"
                  class="filter-checkbox"
                >
                  <span class="filter-group-title">Task Count Filter</span>
                </a-checkbox>
              </div>
              <div class="filter-group-content" :class="{ disabled: !enableWebsiteCountFilter }">
                <div class="range-inputs">
                  <a-input-number
                    v-model:value="minWebsiteCount"
                    :disabled="!enableWebsiteCountFilter"
                    placeholder="Min"
                    :min="0"
                    class="range-input"
                    @change="handleFilterChange"
                  />
                  <span class="range-separator">to</span>
                  <a-input-number
                    v-model:value="maxWebsiteCount"
                    :disabled="!enableWebsiteCountFilter"
                    placeholder="Max"
                    :min="0"
                    class="range-input"
                    @change="handleFilterChange"
                  />
                </div>
              </div>
            </div>

            <!-- Generated Pages Count Filter -->
            <div class="filter-group">
              <div class="filter-group-header">
                <a-checkbox 
                  v-model:checked="enableResultCountFilter" 
                  @change="handleFilterChange"
                  class="filter-checkbox"
                >
                  <span class="filter-group-title">Generated Pages Filter</span>
                </a-checkbox>
              </div>
              <div class="filter-group-content" :class="{ disabled: !enableResultCountFilter }">
                <div class="range-inputs">
                  <a-input-number
                    v-model:value="minResultCount"
                    :disabled="!enableResultCountFilter"
                    placeholder="Min"
                    :min="0"
                    class="range-input"
                    @change="handleFilterChange"
                  />
                  <span class="range-separator">to</span>
                  <a-input-number
                    v-model:value="maxResultCount"
                    :disabled="!enableResultCountFilter"
                    placeholder="Max"
                    :min="0"
                    class="range-input"
                    @change="handleFilterChange"
                  />
                </div>
              </div>
            </div>

            <!-- Deployment Count Filter -->
            <div class="filter-group">
              <div class="filter-group-header">
                <a-checkbox 
                  v-model:checked="enableDeployCountFilter" 
                  @change="handleFilterChange"
                  class="filter-checkbox"
                >
                  <span class="filter-group-title">Deployment Count Filter</span>
                </a-checkbox>
              </div>
              <div class="filter-group-content" :class="{ disabled: !enableDeployCountFilter }">
                <div class="range-inputs">
                  <a-input-number
                    v-model:value="minDeployCount"
                    :disabled="!enableDeployCountFilter"
                    placeholder="Min"
                    :min="0"
                    class="range-input"
                    @change="handleFilterChange"
                  />
                  <span class="range-separator">to</span>
                  <a-input-number
                    v-model:value="maxDeployCount"
                    :disabled="!enableDeployCountFilter"
                    placeholder="Max"
                    :min="0"
                    class="range-input"
                    @change="handleFilterChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile card list instead of table -->
      <div class="mobile-customer-list" v-if="isMobile">
        <div v-if="loading" class="loading-container">
          <a-spin tip="Loading customer data..." />
        </div>
        <div v-else>
          <div 
            v-for="customer in customers" 
            :key="customer.customerId"
            class="customer-card"
            :class="{ 'selected': customer.customerId === selectedCustomerId }"
            @click="handleCustomerSelect(customer)"
          >
            <div class="customer-header">
              <div class="customer-email">{{ customer.email }}</div>
            </div>
            <div class="customer-details">
              <div class="detail-item">
                <span class="label">Customer ID:</span>
                <span class="value">{{ customer.customerId }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Register Time:</span>
                <span class="value">{{ customer.registerTime ? dayjs(customer.registerTime).format('YYYY-MM-DD HH:mm') : '-' }}</span>
              </div>
            </div>
            <div class="customer-actions">
              <a-button type="default" size="small" @click.stop="handleEditPlan(customer)">
                Edit Plan
              </a-button>
              <a-button type="primary" size="small" @click.stop="handleLoginToAltpage(customer)">
                Log into Account
              </a-button>
            </div>
          </div>
          
          <!-- Mobile pagination -->
          <div class="mobile-pagination">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              :showSizeChanger="false"
              :showQuickJumper="false"
              :showTotal="(total) => `Total ${total} records`"
              @change="handleTableChange"
              size="small"
            />
          </div>
        </div>
      </div>
      
      <!-- Desktop table -->
      <a-table
        v-else
        class="customer-table"
        :columns="initializationColumns"
        :data-source="customers"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        :row-class-name="getRowClassName"
        size="small"
        :customRow="customRowHandler"
        :scroll="{ x: 1200 }"
        rowKey="customerId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="default" size="small" @click.stop="handleEditPlan(record)">
                Edit Plan
              </a-button>
              <a-button type="primary" size="small" @click.stop="handleLoginToAltpage(record)">
                 Log into that account
              </a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'customerId'">
            <a-tooltip :title="record.customerId">
              <span>{{ record.customerId }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.key === 'email'">
            <a-tooltip :title="record.email">
              <span>{{ record.email }}</span>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </a-card>


    <!-- Edit Package Modal -->
    <a-modal
      v-model:open="modalVisible"
      title="Trial Package Details"
      :footer="null"
      :width="isMobile ? '95%' : '600px'"
      :centered="isMobile"
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
import { ref, onMounted, onUnmounted, watch, computed, h } from 'vue'
import { message, Tooltip as ATooltip } from 'ant-design-vue'
import { api } from '../api/api'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { 
  WarningOutlined,
  FilterOutlined,
  WifiOutlined,
  TeamOutlined,
  DeploymentUnitOutlined,
  PlayCircleOutlined,
  UserOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `${total} records in total`,
  showSizeChanger: false,
  showQuickJumper: true,
})

// 系统概览仪表盘相关代码已简化，移除了表格定义

// Customer Table Columns
const initializationColumns = [
  { title: 'Customer ID', dataIndex: 'customerId', key: 'customerId', width: 150, ellipsis: true },
  { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
  {
    title: 'Register Time',
    dataIndex: 'registerTime',
    key: 'registerTime',
    width: 180,
    customRender: ({ text }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
  },
  {
    title: 'Actions',
    key: 'action',
    fixed: 'right',
    width: 200,
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

// 在 script setup 中添加以下代码
const searchEmail = ref('') // 搜索关键词
const originalCustomers = ref([]) // 保存原始客户数据

// 新增：筛选条件状态
const taskStatusFilter = ref('all')
const resultStatusFilter = ref('all')
const deployStatusFilter = ref('all')
const subscribeFilter = ref(true) // 新增：订阅状态筛选，默认为true（只显示订阅用户）
const domainBindFilter = ref(false) // 新增：域名绑定筛选，默认为false（不开启筛选）

// 新增：筛选开关状态
const enableWebsiteCountFilter = ref(false)
const enableResultCountFilter = ref(false)
const enableDeployCountFilter = ref(false)

// 数字范围筛选条件状态
const minWebsiteCount = ref(null)
const maxWebsiteCount = ref(null)
const minResultCount = ref(null)
const maxResultCount = ref(null)
const minDeployCount = ref(null)
const maxDeployCount = ref(null)

// 修改 fetchCustomerData 函数，添加筛选参数
const fetchCustomerData = async (page = 1) => {
  loading.value = true;
  selectedCustomerId.value = null;
  selectedCustomer.value = null;

  try {
    // 构建筛选参数
    const filterParams = buildFilterParams();

    console.log('Filter Params:', filterParams);
    
    // 构建请求参数，只有当email有值时才包含email参数
    const requestParams = { 
      page, 
      limit: pagination.value.pageSize,
      ...filterParams // 添加筛选参数
    };
    
    // 只有当searchEmail有值时才添加email参数
    if (searchEmail.value && searchEmail.value.trim()) {
      requestParams.email = searchEmail.value.trim();
    }
    
    const customerResponse = await api.getCustomerList(requestParams);
    
    const rawCustomers = customerResponse.data || [];
    pagination.value.total = customerResponse.TotalCount || 0;
    pagination.value.current = page;

    originalCustomers.value = rawCustomers;
    customers.value = rawCustomers;

  } catch (error) {
    console.error('Failed to fetch customer list:', error);
    message.error('Failed to load customer list');
    customers.value = [];
    originalCustomers.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 修改：构建筛选参数的函数
const buildFilterParams = () => {
  const params = {};
  
  // 订阅状态筛选 - 始终传递此参数
  params.subscribeFilter = subscribeFilter.value;
  
  // 域名绑定筛选 - 始终传递此参数
  params.domainBindFilter = domainBindFilter.value;
  console.log('Domain Bind Filter:', params.domainBindFilter);
  
  // 任务数量筛选 - 只有开启时才传递参数
  if (enableWebsiteCountFilter.value) {
    if (minWebsiteCount.value !== null && minWebsiteCount.value !== undefined) {
      params.minWebsiteCount = minWebsiteCount.value;
    }
    if (maxWebsiteCount.value !== null && maxWebsiteCount.value !== undefined) {
      params.maxWebsiteCount = maxWebsiteCount.value;
    }
  }
  
  // 生成页面数筛选 - 只有开启时才传递参数
  if (enableResultCountFilter.value) {
    if (minResultCount.value !== null && minResultCount.value !== undefined) {
      params.minResultCount = minResultCount.value;
    }
    if (maxResultCount.value !== null && maxResultCount.value !== undefined) {
      params.maxResultCount = maxResultCount.value;
    }
  }
  
  // 部署数量筛选 - 只有开启时才传递参数
  if (enableDeployCountFilter.value) {
    if (minDeployCount.value !== null && minDeployCount.value !== undefined) {
      params.minDeployCount = minDeployCount.value;
    }
    if (maxDeployCount.value !== null && maxDeployCount.value !== undefined) {
      params.maxDeployCount = maxDeployCount.value;
    }
  }
  
  return params;
};

// 修改：处理筛选条件变化（防抖处理）
let filterTimeout = null;
const handleFilterChange = () => {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }
  filterTimeout = setTimeout(() => {
    pagination.value.current = 1; // 重置到第一页
    fetchCustomerData(1);
  }, 500); // 500ms 防抖
};

// 新增：清空筛选条件
const clearFilters = () => {
  // 关闭所有筛选开关
  enableWebsiteCountFilter.value = false;
  enableResultCountFilter.value = false;
  enableDeployCountFilter.value = false;
  domainBindFilter.value = false; // 新增：重置域名绑定筛选
  
  // 重置订阅筛选为默认值
  subscribeFilter.value = true;
  
  // 清空所有数值
  minWebsiteCount.value = null;
  maxWebsiteCount.value = null;
  minResultCount.value = null;
  maxResultCount.value = null;
  minDeployCount.value = null;
  maxDeployCount.value = null;
  
  pagination.value.current = 1;
  fetchCustomerData(1);
};

// 新增：应用筛选条件
const applyFilters = () => {
  pagination.value.current = 1;
  fetchCustomerData(1);
};

// 修改: 处理搜索
const handleSearch = () => {
  pagination.value.current = 1; // 重置到第一页
  fetchCustomerData(1);
};

// 修改: 处理搜索框值变化
const handleSearchChange = (e) => {
  if (!e.target.value) {
    searchEmail.value = '';
    fetchCustomerData(1);
  }
};

// 处理初始化按钮点击
const handleInitialize = (record) => {
  selectedCustomerId.value = record.customerId
  selectedCustomer.value = record
  loadCustomerData(record.customerId)
}

// 加载客户相关数据
const loadCustomerData = async (customerId) => {
  // 客户数据加载逻辑
  // 这里可以添加其他需要加载的客户相关数据
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
      if (selectedCustomerId.value !== record.customerId) { // 仅在切换客户时执行
        selectedCustomerId.value = record.customerId
        selectedCustomer.value = record
        loadCustomerData(record.customerId) // 这个函数现在会加载错误日志
      }
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
      const authUrl = `https://seopage.ai/?accessToken=${encodeURIComponent(response.accessToken)}&customerId=${encodeURIComponent(customerId)}&email=${encodeURIComponent(customerEmail)}`;
      
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

// 修改：基于新接口数据的图表配置
const registerChartOption = computed(() => {
  const data = customerRegisterStatisticData.value?.data || [];
  const dateList = data.map(item => item.date);
  const countList = data.map(item => item.count);
  
  return {
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const date = params[0].axisValueLabel;
        const count = params[0].value;
        return `${date}<br/>注册数: ${count}`;
      }
    },
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
            return '{highlight|' + value + '}\n{tag|🚀 Service First Online}'
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
        data: countList,
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

// 新增：获取客户注册统计信息
const fetchCustomerRegisterStatistic = async () => {
  customerRegisterStatisticLoading.value = true
  try {
    const response = await api.getCustomerRegisterStatistic()
    customerRegisterStatisticData.value = response
    console.log('Customer Register Statistic Data:', response)
  } catch (error) {
    console.error('Failed to fetch customer register statistic:', error)
    message.error('获取客户注册统计信息失败')
    customerRegisterStatisticData.value = null
  } finally {
    customerRegisterStatisticLoading.value = false
  }
}

// 新增：邀请码注册数量统计
const inviteCodeStats = computed(() => {
  // 由于新接口只返回日期和数量，没有邀请码信息
  // 这里暂时返回空对象，如果需要邀请码统计，可能需要其他接口
  return {};
});

// 添加更新注册图表数据的函数
const updateRegisterChartData = () => {
  fetchCustomerRegisterStatistic();
};


// 添加移动端检测
const isMobile = ref(false)

// 检测设备类型
const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

// 处理客户选择（移动端）
const handleCustomerSelect = (customer) => {
  if (selectedCustomerId.value !== customer.customerId) {
    selectedCustomerId.value = customer.customerId
    selectedCustomer.value = customer
    loadCustomerData(customer.customerId)
  }
}

// SSE相关代码已移除

// 新增：客户统计相关状态
const customerStatisticLoading = ref(false)
const customerStatisticData = ref(null)

// 获取客户统计信息
const fetchCustomerStatistic = async () => {
  customerStatisticLoading.value = true
  try {
    const response = await api.getCustomerStatistic()
    customerStatisticData.value = response
    console.log('Customer Statistic Data:', response)
    
    // 调试输出详细信息
    if (response) {
      console.log('Response structure:', JSON.stringify(response, null, 2))
      console.log('Data property:', response.data)
      console.log('unsubscribedNoTask:', response.data?.unsubscribedNoTask)
      console.log('unsubscribeTaskOne:', response.data?.unsubscribeTaskOne)
      console.log('unsubscribeDeployOne:', response.data?.unsubscribeDeployOne)
    }
  } catch (error) {
    console.error('Failed to fetch customer statistic:', error)
    message.error('获取客户统计信息失败')
    customerStatisticData.value = null
  } finally {
    customerStatisticLoading.value = false
  }
}

// 新增：格式化统计标签
const formatStatisticLabel = (key) => {
  const labelMap = {
    unsubscribeDeployOne: '未订阅，有部署页面的客户数',
    unsubscribeTaskOne: '未订阅，有开启过任务的客户数', 
    unsubscribedNoTask: '未订阅，未跑过一次任务的客户数',
  }
  return labelMap[key] || key
}

// 格式化统计值
const formatStatisticValue = (value) => {
  // 如果值是对象，返回'-'
  if (value === null || value === undefined || typeof value === 'object') {
    return '-';
  }
  
  // 如果值是数字，格式化为带千分位的字符串
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  // 尝试将值转换为数字并格式化
  const num = Number(value);
  if (!isNaN(num)) {
    return num.toLocaleString();
  }
  
  // 其他情况返回原始值或'-'
  return value || '-';
}

// 计算总注册数
const totalRegistrations = computed(() => {
  // 确保返回一个数字
  const count = customerRegisterStatisticData.value?.totalCount;
  return typeof count === 'number' ? count : 0;
})

// 新增：客户注册统计相关状态
const customerRegisterStatisticLoading = ref(false)
const customerRegisterStatisticData = ref(null)

// 修改：计算HIGHLIGHT_DATE之后的注册总数
const totalRegistrationsAfterHighlight = computed(() => {
  const data = customerRegisterStatisticData.value?.data || [];
  const highlightDayjs = dayjs(HIGHLIGHT_DATE);
  
  return data
    .filter(item => dayjs(item.date).isAfter(highlightDayjs))
    .reduce((total, item) => total + item.count, 0);
});

// 添加计算属性：今日注册数
const todayRegistrations = computed(() => {
  const data = customerRegisterStatisticData.value?.data || [];
  const today = dayjs().format('YYYY-MM-DD');
  const todayData = data.find(item => item.date === today);
  return todayData ? todayData.count : 0;
});

// 添加计算属性：昨日注册数
const yesterdayRegistrations = computed(() => {
  const data = customerRegisterStatisticData.value?.data || [];
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const yesterdayData = data.find(item => item.date === yesterday);
  return yesterdayData ? yesterdayData.count : 0;
});

// 添加计算属性：过去7天注册数
const last7DaysRegistrations = computed(() => {
  const data = customerRegisterStatisticData.value?.data || [];
  const sevenDaysAgo = dayjs().subtract(7, 'day');
  
  return data
    .filter(item => dayjs(item.date).isAfter(sevenDaysAgo) || dayjs(item.date).isSame(sevenDaysAgo, 'day'))
    .reduce((total, item) => total + item.count, 0);
});

// 添加计算属性：过去15天注册数
const last15DaysRegistrations = computed(() => {
  const data = customerRegisterStatisticData.value?.data || [];
  const fifteenDaysAgo = dayjs().subtract(15, 'day');
  
  return data
    .filter(item => dayjs(item.date).isAfter(fifteenDaysAgo) || dayjs(item.date).isSame(fifteenDaysAgo, 'day'))
    .reduce((total, item) => total + item.count, 0);
});

// 修改组件挂载时的初始化逻辑
onMounted(async () => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
  
  console.log('Component mounted, fetching initial data...')
  await fetchCustomerStatistic() // 获取客户统计
  await fetchCustomerRegisterStatistic() // 获取客户注册统计
  await fetchCustomerData()
  await fetchPackageList()
  
  if (customers.value.length > 0 && !selectedCustomerId.value) {
    selectedCustomerId.value = customers.value[0].customerId
    selectedCustomer.value = customers.value[0]
    await loadCustomerData(selectedCustomerId.value)
  }
  console.log('Initial data fetching complete.')
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})

// 新增：检查是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return enableWebsiteCountFilter.value || 
         enableResultCountFilter.value || 
         enableDeployCountFilter.value ||
         domainBindFilter.value || // 新增：域名绑定筛选激活检查
         subscribeFilter.value === false; // 当显示未订阅用户时也算作激活筛选
})

// 计算百分比
const calculatePercentage = (value, total) => {
  // 确保值是数字
  const numValue = Number(value) || 0;
  const numTotal = Number(total) || 1; // 避免除以0，默认为1
  
  if (numTotal === 0) return '0%';
  const percentage = ((numValue / numTotal) * 100).toFixed(1);
  return `${percentage}%`;
};

// 计算转化率
const calculateConversionRate = (current, previous) => {
  // 确保值是数字
  const numCurrent = Number(current) || 0;
  const numPrevious = Number(previous) || 1; // 避免除以0，默认为1
  
  if (numPrevious === 0) return '0%';
  const rate = ((numCurrent / numPrevious) * 100).toFixed(1);
  return `${rate}%`;
};
</script>

<style scoped>
/* 基础样式 */
.initialization-container {
  padding: 16px;
  max-width: 100%;
}

/* 卡片样式 */
.section-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

/* 仪表盘样式 */
.dashboard-stats {
  padding: 16px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  min-width: 200px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item.highlight {
  background-color: #fff1f0;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
}

.stat-item.highlight .stat-label {
  color: #ff4d4f;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-item.highlight .stat-value {
  color: #ff4d4f;
}

.stat-percentage {
  font-size: 14px;
  color: #1890ff;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item.highlight .stat-percentage {
  color: #ff4d4f;
}

.percentage-formula {
  font-size: 11px;
  color: #8c8c8c;
  font-style: italic;
}

/* 图表样式 */
.mobile-chart {
  width: 100%;
  height: 300px;
}

.registration-stats-section {
  margin-top: 24px;
  padding: 0 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1890ff;
}

.chart-container {
  margin-top: 24px;
  padding: 0 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

/* 筛选器样式 */
.filter-container {
  width: 100%;
  margin-top: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.filter-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.header-search-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-search-input {
  width: 200px;
}

.header-customer-stats {
  display: flex;
  gap: 12px;
}

.stats-text {
  font-size: 12px;
  color: #666;
}

.stats-number {
  font-weight: 600;
  color: #1890ff;
}

.filter-header-actions {
  display: flex;
  gap: 8px;
}

.filter-content {
  padding: 12px;
}

.filter-group {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-group-header {
  margin-bottom: 12px;
}

.filter-group-title {
  font-weight: 500;
}

.filter-group-content {
  padding-left: 8px;
}

.filter-group-content.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  width: 100px;
}

/* 客户卡片样式（移动端） */
.mobile-customer-list {
  padding: 0 4px;
}

.customer-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.customer-card.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.customer-email {
  font-weight: 600;
  word-break: break-all;
}

.customer-status {
  flex-shrink: 0;
}

.error-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #faad14;
  font-size: 12px;
}

.no-error-indicator {
  color: #52c41a;
  font-size: 12px;
}

.customer-details {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  margin-bottom: 4px;
  font-size: 13px;
}

.detail-item .label {
  width: 80px;
  color: #666;
}

.customer-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}


/* 加载和空状态样式 */
.loading-container, .empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

/* 移动端分页样式 */
.mobile-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 16px;
}

/* 移动端标题样式 */
.section-title-mobile {
  margin-bottom: 8px;
}

.header-actions-mobile {
  margin-bottom: 8px;
}

.mobile-select {
  width: 100%;
}

.title-and-summary-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invite-code-stats-mobile {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.invite-code-item {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .initialization-container {
    padding: 8px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .dashboard-header-right {
    width: 100%;
    margin-top: 8px;
  }

  .step-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .inactive-users-module {
    width: 100%;
    margin-top: 8px;
  }

  .filter-title-section {
    margin-bottom: 8px;
    width: 100%;
  }

  .header-search-section {
    width: 100%;
    justify-content: space-between;
  }

  .header-search-input {
    width: 100%;
    max-width: 200px;
  }

  .filter-header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .range-inputs {
    flex-wrap: wrap;
  }
}

/* 表格选中行样式 */
:deep(.selected-row) {
  background-color: #e6f7ff;
}

/* 模态框样式 */
.package-form {
  max-width: 100%;
}

/* 添加注册汇总统计样式 */
.register-summary-stats {
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.register-summary-row {
  display: flex;
  gap: 16px;
}

.register-summary-item {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 8px 12px;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 13px;
  color: #666;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .register-summary-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .register-summary-item {
    width: 100%;
  }
}

/* 添加平铺注册汇总统计样式 */
.register-summary-stats-flat {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
  padding: 0 16px;
}

.register-summary-item-flat {
  flex: 1;
  min-width: 150px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.register-summary-item-flat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-value-large {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.summary-label-large {
  font-size: 14px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .register-summary-stats-flat {
    flex-direction: column;
    padding: 0 8px;
  }
  
  .register-summary-item-flat {
    width: 100%;
  }
}
</style>