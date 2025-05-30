<template>
  <div class="initialization-container">
    <!-- 新增：客户统计信息 -->
    <a-card class="section-card">
      <div class="section-header">
        <div class="section-title-mobile">
          <span class="section-title">客户统计信息</span>
        </div>
        <div class="header-actions-mobile">
          <a-button 
            type="primary" 
            size="small" 
            :loading="customerStatisticLoading"
            @click="fetchCustomerStatistic"
          >
            刷新统计
          </a-button>
        </div>
      </div>
      <div v-if="customerStatisticLoading" class="loading-container">
        <a-spin tip="获取客户统计信息中..." />
      </div>
      <div v-else-if="customerStatisticData && customerStatisticData.data" class="statistic-content">
        <!-- 移动端使用卡片布局 -->
        <div class="statistic-grid-mobile" v-if="isMobile">
          <!-- 总注册数 -->
          <div class="statistic-card-mobile highlight-card">
            <div class="statistic-label">总注册用户数</div>
            <div class="statistic-value">{{ totalRegistrations }}</div>
          </div>
          <!-- 自指定日期以来的注册数 -->
          <div class="statistic-card-mobile highlight-card">
            <div class="statistic-label">自 {{ HIGHLIGHT_DATE }} 以来注册数</div>
            <div class="statistic-value">{{ totalRegistrationsAfterHighlight }}</div>
          </div>
          <!-- 原有统计数据 -->
          <div v-for="(value, key) in customerStatisticData.data" :key="key" class="statistic-card-mobile">
            <div class="statistic-label">{{ formatStatisticLabel(key) }}</div>
            <div class="statistic-value">{{ formatStatisticValue(value) }}</div>
          </div>
        </div>
        <!-- 桌面端使用网格布局 -->
        <div class="statistic-grid-desktop" v-else>
          <!-- 总注册数 -->
          <div class="statistic-item-desktop highlight-item">
            <div class="statistic-label">总注册用户数</div>
            <div class="statistic-value">{{ totalRegistrations }}</div>
          </div>
          <!-- 自指定日期以来的注册数 -->
          <div class="statistic-item-desktop highlight-item">
            <div class="statistic-label">自 {{ HIGHLIGHT_DATE }} 以来注册数</div>
            <div class="statistic-value">{{ totalRegistrationsAfterHighlight }}</div>
          </div>
          <!-- 原有统计数据 -->
          <div v-for="(value, key) in customerStatisticData.data" :key="key" class="statistic-item-desktop">
            <div class="statistic-label">{{ formatStatisticLabel(key) }}</div>
            <div class="statistic-value">{{ formatStatisticValue(value) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty-container">
        <a-empty description="暂无统计数据" />
      </div>
    </a-card>

    <!-- SSE Connection Status -->
    <a-card class="section-card">
      <div class="section-header">
        <div class="section-title-mobile">
          <span class="section-title">系统状态监控</span>
        </div>
        <div class="header-actions-mobile">
          <a-button 
            type="primary" 
            size="small" 
            :loading="sseStatusLoading"
            @click="fetchSSEStatus"
          >
            刷新状态
          </a-button>
        </div>
      </div>
      
      <div class="sse-status-content">
        <div class="status-item">
          <span class="status-label">SSE连接数:</span>
          <span class="active-connections">{{ sseConnectionCount }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">最后更新:</span>
          <span class="status-value">{{ lastSSEUpdateTime }}</span>
        </div>
        <div class="status-item">
          <div :class="['status-indicator', sseConnectionCount > 0 ? 'online' : 'offline']">
            <span class="indicator-dot"></span>
            <span class="indicator-text">{{ sseConnectionCount > 0 ? '服务在线' : '服务离线' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 移除重复的通知偏好统计显示 -->
    </a-card>

    <!-- Error Monitoring Dashboard -->
    <a-card class="section-card">
      <div class="section-header">
        <div class="section-title-mobile">
          <span class="section-title">错误监控仪表盘</span>
        </div>
        <div class="header-actions-mobile">
           <span class="date-label">日期范围:</span>
           <a-select
             v-model:value="errorDashboardDays"
             class="mobile-select"
             :options="errorDashboardDateOptions"
             @change="handleErrorDashboardDateChange"
           >
             <template #suffixIcon><CalendarOutlined /></template>
           </a-select>
        </div>
      </div>
      <div v-if="errorDashboardLoading" class="loading-container">
        <a-spin tip="加载错误数据中..." />
      </div>
      <div v-else-if="errorDashboardData && errorDashboardData.length > 0">
        <v-chart
          :option="errorDashboardChartOption"
          autoresize
          class="mobile-chart"
        />
      </div>
      <div v-else class="empty-container">
        <a-empty :description="`最近 ${errorDashboardDays} 天内无错误数据`" />
      </div>
    </a-card>

    <!-- User Registration Trend -->
    <a-card class="section-card">
      <div class="section-header">
        <div class="title-and-summary-mobile">
          <span class="section-title">用户注册趋势</span>
          <div class="registration-summary-mobile">
            自 {{ HIGHLIGHT_DATE }} 以来总注册数:
            <span class="count">{{ totalRegistrationsAfterHighlight }}</span>
          </div>
          <!-- 邀请码统计 - 移动端换行显示 -->
          <div class="invite-code-stats-mobile">
            <template v-for="(count, code) in inviteCodeStats" :key="code">
              <span class="invite-code-item">
                {{ code }}: {{ count }}
              </span>
            </template>
          </div>
        </div>
        <div class="header-actions-mobile">
          <a-select v-model:value="registerStatsDays" class="mobile-select" @change="updateRegisterChartData">
            <a-select-option :value="30">最近30天</a-select-option>
            <a-select-option :value="90">最近90天</a-select-option>
            <a-select-option :value="0">全部</a-select-option>
          </a-select>
        </div>
      </div>
      <v-chart
        :option="registerChartOption"
        autoresize
        class="mobile-chart"
      />
    </a-card>

    <!-- Customer Management -->
    <a-card class="section-card">
      <div class="section-header">
        <span class="section-title">客户管理</span>
        <div class="header-actions-mobile">
          <!-- 新增：筛选条件 -->
          <div class="filter-section">
            <div class="filter-row">
              <span class="filter-label">任务状态筛选:</span>
              <a-select
                v-model:value="taskStatusFilter"
                class="filter-select"
                placeholder="选择任务状态"
                allowClear
                @change="handleFilterChange"
              >
                <a-select-option value="all">全部客户</a-select-option>
                <a-select-option value="hasTask">有发起过任务</a-select-option>
                <a-select-option value="noTask">未发起过任务</a-select-option>
              </a-select>
            </div>
            <div class="filter-row">
              <span class="filter-label">页面生成筛选:</span>
              <a-select
                v-model:value="resultStatusFilter"
                class="filter-select"
                placeholder="选择生成状态"
                allowClear
                @change="handleFilterChange"
              >
                <a-select-option value="all">全部客户</a-select-option>
                <a-select-option value="hasResult">有生成成功页面</a-select-option>
                <a-select-option value="noResult">未生成成功页面</a-select-option>
              </a-select>
            </div>
            <div class="filter-row">
              <span class="filter-label">部署状态筛选:</span>
              <a-select
                v-model:value="deployStatusFilter"
                class="filter-select"
                placeholder="选择部署状态"
                allowClear
                @change="handleFilterChange"
              >
                <a-select-option value="all">全部客户</a-select-option>
                <a-select-option value="hasDeploy">有部署过页面</a-select-option>
                <a-select-option value="noDeploy">未部署过页面</a-select-option>
              </a-select>
            </div>
          </div>
          <a-input-search
            v-model:value="searchEmail"
            placeholder="搜索邮箱"
            class="mobile-search"
            @search="handleSearch"
            @change="handleSearchChange"
            allowClear
          />
        </div>
      </div>
      
      <!-- 移动端使用卡片列表替代表格 -->
      <div class="mobile-customer-list" v-if="isMobile">
        <div v-if="loading" class="loading-container">
          <a-spin tip="加载客户数据中..." />
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
              <div class="customer-status">
                <span v-if="customer.hasRecentErrors === true" class="error-indicator">
                  <WarningOutlined />
                  有错误
                </span>
                <span v-else-if="customer.hasRecentErrors === false" class="no-error-indicator">
                  正常
                </span>
              </div>
            </div>
            <div class="customer-details">
              <div class="detail-item">
                <span class="label">客户ID:</span>
                <span class="value">{{ customer.customerId }}</span>
              </div>
              <div class="detail-item">
                <span class="label">邀请码:</span>
                <span class="value">{{ customer.inviteCode || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">注册时间:</span>
                <span class="value">{{ customer.registerTime ? dayjs(customer.registerTime).format('YYYY-MM-DD HH:mm') : '-' }}</span>
              </div>
            </div>
            <div class="customer-actions">
              <a-button type="default" size="small" @click.stop="handleEditPlan(customer)">
                编辑计划
              </a-button>
              <a-button type="primary" size="small" @click.stop="handleLoginToAltpage(customer)">
                前往Altpage
              </a-button>
            </div>
          </div>
          
          <!-- 移动端分页 -->
          <div class="mobile-pagination">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              :showSizeChanger="false"
              :showQuickJumper="false"
              :showTotal="(total) => `共 ${total} 条`"
              @change="handleTableChange"
              size="small"
            />
          </div>
        </div>
      </div>
      
      <!-- 桌面端保持原有表格 -->
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
        :scroll="{ x: 1500 }"
        rowKey="customerId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="default" size="small" @click.stop="handleEditPlan(record)">
                Edit Plan
              </a-button>
              <a-button type="primary" size="small" @click.stop="handleLoginToAltpage(record)">
                Goto Altpage
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
          <template v-if="column.key === 'inviteCode'">
            <a-tooltip :title="record.inviteCode">
              <span>{{ record.inviteCode }}</span>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Error Logs -->
    <a-card
      v-if="selectedCustomerId"
      class="section-card error-log-section"
    >
      <div class="section-header">
        <div class="section-title-mobile">
          <span class="section-title">{{ selectedCustomer?.email || '选中客户' }} 的错误日志</span>
        </div>
        <div class="header-actions-mobile">
           <span class="date-label">日期范围:</span>
           <a-select
             v-model:value="errorLogDays"
             class="mobile-select"
             :options="errorLogDateOptions"
             @change="handleErrorLogDateChange"
           >
             <template #suffixIcon><CalendarOutlined /></template>
           </a-select>
        </div>
      </div>
      
      <!-- 移动端错误日志列表 -->
      <div class="mobile-error-list" v-if="isMobile">
        <div v-if="errorLogLoading" class="loading-container">
          <a-spin tip="加载错误日志中..." />
        </div>
        <div v-else-if="errorLogs.length > 0">
          <div v-for="log in errorLogs" :key="log.id" class="error-log-card">
            <div class="error-header">
              <span class="error-time">{{ dayjs(log.createdAt).format('MM-DD HH:mm') }}</span>
              <span class="error-module">{{ log.module }}</span>
            </div>
            <div class="error-operation">{{ log.operation }}</div>
            <div class="error-website" v-if="log.websiteId">
              <span class="label">网站ID:</span>
              <span class="value">{{ log.websiteId }}</span>
            </div>
            <div class="error-detail">
              <a-typography-paragraph 
                :ellipsis="{ rows: 2, expandable: true, symbol: '展开' }"
                :content="log.errorDetail"
              />
            </div>
          </div>
          
          <!-- 移动端错误日志分页 -->
          <div class="mobile-pagination">
            <a-pagination
              v-model:current="errorLogPagination.current"
              :total="errorLogPagination.total"
              :pageSize="errorLogPagination.pageSize"
              :showSizeChanger="false"
              :showQuickJumper="false"
              :showTotal="(total) => `共 ${total} 条`"
              @change="handleErrorLogTableChange"
              size="small"
            />
          </div>
        </div>
        <div v-else class="empty-container">
          <a-empty :description="`选定时间段内无错误日志 (${errorLogDays} 天)`" />
        </div>
      </div>
      
      <!-- 桌面端保持原有表格 -->
      <a-table
        v-else
        :columns="errorLogColumns"
        :data-source="errorLogs"
        :pagination="errorLogPagination"
        :loading="errorLogLoading"
        @change="handleErrorLogTableChange"
        size="small"
        :scroll="{ x: 800 }"
        rowKey="id"
      >
        <template #emptyText>
          <a-empty :description="`No error logs found for the selected period (${errorLogDays} days).`" />
        </template>
        <template #bodyCell="{ column, text }">
            <template v-if="column.key === 'errorMessage'">
              <a-tooltip :title="text" placement="topLeft">
                <span>{{ text }}</span>
              </a-tooltip>
            </template>
          </template>
      </a-table>
    </a-card>

    <!-- Edit Package Modal -->
    <a-modal
      v-model:open="modalVisible"
      title="试用套餐详情"
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
  CalendarOutlined,
  WarningOutlined
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

// 新增：错误仪表盘相关状态
const errorDashboardLoading = ref(false)
const errorDashboardData = ref(null)
const errorDashboardDays = ref(15) // 新增: 默认显示最近1天的数据
const errorDashboardDateOptions = [ // 新增: 日期选项
  { value: 1, label: 'Last 1 Day' },
  { value: 3, label: 'Last 3 Days' },
  { value: 7, label: 'Last 7 Days' },
  { value: 15, label: 'Last 15 Days' },
  { value: 30, label: 'Last 30 Days' },
]

// 新增：获取错误仪表盘数据函数
const fetchErrorDashboardData = async () => {
  errorDashboardLoading.value = true
  try {
    // 计算开始和结束日期
    const endDate = dayjs()
    const startDate = endDate.subtract(errorDashboardDays.value, 'day')

    // 调用 api.getErrorDashboard 并传入 YYYY-MM-DD 格式的日期参数
    // api.getErrorDashboard 返回的是 { code, message, data: [...] } 结构
    const response = await api.getErrorDashboard({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
    })

    // 修改: 从返回的对象中提取 data 属性（这才是真正的数组）
    // 确保 response 存在并且 response.data 是一个数组
    const actualDataArray = response && Array.isArray(response.data) ? response.data : [];

    errorDashboardData.value = actualDataArray;
    console.log('Error Dashboard Data (final):', errorDashboardData.value) // 添加日志确认最终值

  } catch (error) {
    console.error('Failed to fetch error dashboard data:', error)
    message.error('Failed to fetch error dashboard data')
    errorDashboardData.value = [] // 出错时设置为空数组
  } finally {
    errorDashboardLoading.value = false
  }
}

// 新增: 处理错误仪表盘日期范围变化的函数
const handleErrorDashboardDateChange = () => {
  fetchErrorDashboardData() // 重新获取数据
}

// 新增: 错误仪表盘图表配置
const errorDashboardChartOption = computed(() => {
  const data = errorDashboardData.value || [];
  const dateList = data.map(item => item.date);
  const totalTasksList = data.map(item => item.totalTasks);
  const failedTasksList = data.map(item => item.failedTasks);
  // 失败率可以作为提示信息显示，或者使用双 Y 轴（更复杂）
  // const failureRateList = data.map(item => parseFloat(item.failureRate) || 0);

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => { // 自定义 tooltip 显示内容
        let tooltipStr = `${params[0].axisValueLabel}<br/>`;
        params.forEach(item => {
          const seriesName = item.seriesName;
          const value = item.value;
          // 查找原始数据以获取失败率
          const originalData = data.find(d => d.date === item.axisValueLabel);
          let rateStr = '';
          if (seriesName === 'Failed Tasks' && originalData) {
            rateStr = ` (${originalData.failureRate})`;
          } else if (seriesName === 'Total Tasks' && originalData && originalData.totalTasks > 0) {
             // 可选：如果需要在 Total Tasks 旁边也显示失败率
             // rateStr = ` (Failure Rate: ${originalData.failureRate})`;
          }
          tooltipStr += `${item.marker}${seriesName}: ${value}${rateStr}<br/>`;
        });
        return tooltipStr;
      }
    },
    legend: { // 添加图例
      data: ['Total Tasks', 'Failed Tasks'],
      top: 'bottom', // 图例放在底部
      padding: [20, 0, 0, 0] // 增加底部内边距给图例空间
    },
    grid: { left: 50, right: 20, top: 40, bottom: 60 }, // 调整 grid 留出图例空间
    xAxis: {
      type: 'category',
      data: dateList,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      minInterval: 1, // 保证 Y 轴刻度是整数
      min: 0
    },
    series: [
      {
        name: 'Total Tasks',
        type: 'line',
        data: totalTasksList,
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#5470c6' }, // 蓝色系
        itemStyle: { color: '#5470c6' }
      },
      {
        name: 'Failed Tasks',
        type: 'line',
        data: failedTasksList,
        smooth: true,
        symbol: 'circle',
        lineStyle: { color: '#ee6666' }, // 红色系
        itemStyle: { color: '#ee6666' }
      }
      // 如果需要显示失败率作为单独的线（可能需要双 Y 轴）
      // {
      //   name: 'Failure Rate',
      //   type: 'line',
      //   yAxisIndex: 1, // 需要配置第二个 Y 轴
      //   data: failureRateList,
      //   smooth: true,
      //   symbol: 'circle',
      //   lineStyle: { color: '#91cc75' }, // 绿色系
      //   itemStyle: { color: '#91cc75' }
      // }
    ]
    // 如果需要双 Y 轴，取消注释下面的 yAxis 配置
    // yAxis: [
    //   { // 第一个 Y 轴（任务数）
    //     type: 'value',
    //     name: 'Tasks',
    //     minInterval: 1,
    //     min: 0
    //   },
    //   { // 第二个 Y 轴（失败率）
    //     type: 'value',
    //     name: 'Failure Rate (%)',
    //     min: 0,
    //     max: 100, // 假设失败率最大为 100%
    //     axisLabel: {
    //       formatter: '{value} %'
    //     }
    //   }
    // ],
  };
});

// Customer Table Columns
const initializationColumns = [
  { title: 'Customer ID', dataIndex: 'customerId', key: 'customerId', width: 150, ellipsis: true },
  { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true },
  { title: 'Invite Code', dataIndex: 'inviteCode', key: 'inviteCode', width: 120 },
  {
    title: 'Recent Errors (Last 15 Days)',
    dataIndex: 'hasRecentErrors',
    key: 'recentErrors',
    width: 180,
    customRender: ({ record }) => {
      if (record.hasRecentErrors === true) {
        return h('span', { style: { color: '#faad14' } }, [
          h(WarningOutlined, { style: { marginRight: '8px' } }),
          'Errors encountered'
        ]);
      } else if (record.hasRecentErrors === false) {
        return h('span', { style: { color: '#52c41a' } }, '-');
      } else {
        return h('span', {}, 'Checking...');
      }
    },
  },
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

// 修改 fetchCustomerData 函数，添加筛选参数
const fetchCustomerData = async (page = 1) => {
  loading.value = true;
  selectedCustomerId.value = null;
  selectedCustomer.value = null;
  errorLogs.value = [];

  try {
    // 构建筛选参数
    const filterParams = buildFilterParams();
    
    const customerResponse = await api.getCustomerList({ 
      page, 
      limit: pagination.value.pageSize,
      email: searchEmail.value,
      ...filterParams // 添加筛选参数
    });
    
    const rawCustomers = customerResponse.data || [];
    pagination.value.total = customerResponse.TotalCount || 0;
    pagination.value.current = page;

    const customersWithStatus = rawCustomers.map(c => ({ ...c, hasRecentErrors: null }));
    originalCustomers.value = customersWithStatus;
    customers.value = customersWithStatus;

    // Prepare error check promises
    const errorCheckPromises = rawCustomers.map(customer => {
      const endTime = dayjs();
      const startTime = endTime.subtract(15, 'day'); // Check last 15 days
      return api.getAlternativelyErrors({
        customerId: customer.customerId,
        startTime: startTime.format('YYYY-MM-DD'),
        endTime: endTime.format('YYYY-MM-DD'),
        page: 1,
        limit: 1, // We only need to know if *any* error exists (count > 0)
      }).then(response => ({
        customerId: customer.customerId,
        hasErrors: (response.totalCount || 0) > 0,
      })).catch(err => {
        console.error(`Failed to check errors for ${customer.customerId}:`, err);
        return { customerId: customer.customerId, hasErrors: false, error: true }; // Assume no errors on failure for safety, maybe log?
      });
    });

    // Wait for all error checks to complete
    const errorResults = await Promise.allSettled(errorCheckPromises);

    // Update customer data with error status
    const finalCustomers = customers.value.map(customer => {
      const result = errorResults.find(r => r.status === 'fulfilled' && r.value.customerId === customer.customerId);
      if (result) {
        return { ...customer, hasRecentErrors: result.value.hasErrors };
      }
      // Handle potential rejections if needed, though catch above defaults to false
      return { ...customer, hasRecentErrors: false }; // Default if promise failed unexpectedly
    });

    customers.value = finalCustomers;

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

// 新增：构建筛选参数的函数
const buildFilterParams = () => {
  const params = {};
  
  // 任务状态筛选
  if (taskStatusFilter.value === 'hasTask') {
    params.minWebsiteCount = 1; // 至少有1个任务
  } else if (taskStatusFilter.value === 'noTask') {
    params.minWebsiteCount = 0; // 最小0个任务
    params.maxWebsiteCount = 0; // 最大0个任务
  }
  
  // 页面生成状态筛选
  if (resultStatusFilter.value === 'hasResult') {
    params.minResultCount = 1; // 至少有1个生成成功的页面
  } else if (resultStatusFilter.value === 'noResult') {
    params.minResultCount = 0; // 最小0个生成页面
    params.maxResultCount = 0; // 最大0个生成页面
  }
  
  // 部署状态筛选
  if (deployStatusFilter.value === 'hasDeploy') {
    params.minDeployCount = 1; // 至少有1个部署
  } else if (deployStatusFilter.value === 'noDeploy') {
    params.minDeployCount = 0; // 最小0个部署
    params.maxDeployCount = 0; // 最大0个部署
  }
  
  return params;
};

// 新增：处理筛选条件变化
const handleFilterChange = () => {
  pagination.value.current = 1; // 重置到第一页
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
  // 重置错误日志状态
  errorLogs.value = [];
  errorLogPagination.value.current = 1;
  errorLogPagination.value.total = 0;
  // 获取错误日志 (使用当前选定的日期范围)
  await fetchErrorLogs(customerId, 1); // 默认加载第一页
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
const totalRegistrationsAfterHighlight = ref(0) // 新增: 415之后注册总数

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
            // 🚀 上线日 🚀
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
    const res = await api.getCustomerList({ page: 1, limit: 2000 })
    registerStats.value = (res.data || []).map(item => ({
      registerTime: item.registerTime,
      inviteCode: item.inviteCode
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

  // --- 修改: 计算 HIGHLIGHT_DATE 之后的总注册数 ---
  let countAfterHighlight = 0;
  const highlightDayjs = dayjs(HIGHLIGHT_DATE);
  // 直接遍历原始数据 registerStats 来比较完整时间戳
  registerStats.value.forEach(item => {
    // 使用 isAfter 比较完整时间戳，这样会包含 HIGHLIGHT_DATE 当天的注册
    if (item.registerTime && dayjs(item.registerTime).isAfter(highlightDayjs)) {
      countAfterHighlight++;
    }
  });
  totalRegistrationsAfterHighlight.value = countAfterHighlight; // 这里现在应该会得到 18
  // --- 计算结束 ---

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

// 新增：邀请码注册数量统计
const inviteCodeStats = computed(() => {
  const stats = {};
  const highlightDayjs = dayjs(HIGHLIGHT_DATE);
  registerStats.value.forEach(item => {
    // 只统计 2025-04-15 之后的注册 (使用 isAfter 比较完整时间戳)
    if (item.registerTime && dayjs(item.registerTime).isAfter(highlightDayjs)) {
      const code = item.inviteCode || '(No Invite Code)';
      stats[code] = (stats[code] || 0) + 1;
    }
  });
  return stats; // 这里应该得到 { '(No Invite Code)': 17, 'LBYALTPAGE': 1 }
});

// 新增：错误日志相关状态
const errorLogLoading = ref(false)
const errorLogs = ref([])
const errorLogPagination = ref({
  current: 1,
  pageSize: 5, // 每页显示5条
  total: 0,
  showTotal: total => `${total} records in total`,
  showSizeChanger: false, // 不显示切换每页条数选项
})
const errorLogDays = ref(15) // Default to last 15 days
const errorLogDateOptions = [
  { value: 1, label: 'Last 1 Day' },
  { value: 3, label: 'Last 3 Days' },
  { value: 7, label: 'Last 7 Days' },
  { value: 15, label: 'Last 15 Days' }, // Ensure 15 is an option
  { value: 30, label: 'Last 30 Days' },
]

// 新增: 错误日志表格列定义
const errorLogColumns = [
  {
    title: 'Time',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    customRender: ({ text }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    defaultSortOrder: 'descend' // 默认按时间降序
  },
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
    width: 200,
    ellipsis: true,
  },
  {
    title: 'Website ID',
    dataIndex: 'websiteId',
    key: 'websiteId',
    width: 250,
    ellipsis: true,
  },
  {
    title: 'Error Details',
    dataIndex: 'errorDetail',
    key: 'errorDetail',
    ellipsis: true, // 使用 antd 的省略号功能
    customRender: ({ text }) => h(
      ATooltip,
      { title: text }, // 鼠标悬浮时显示完整内容
      () => h('span', text) // 表格单元格内显示省略的文本
    )
  },
  // 可以选择性地添加 errorId 列，如果需要的话
  // {
  //   title: 'Error ID',
  //   dataIndex: 'errorId',
  //   key: 'errorId',
  //   width: 250,
  //   ellipsis: true,
  // },
];

// 获取错误日志数据
const fetchErrorLogs = async (customerId, page = 1) => {
  if (!customerId) return;
  errorLogLoading.value = true;
  try {
    const endDate = dayjs();
    const startDate = endDate.subtract(errorLogDays.value, 'day'); // 使用 errorLogDays 控制范围

    const response = await api.getAlternativelyErrors({
      customerId: customerId,
      startTime: startDate.format('YYYY-MM-DD'),
      endTime: endDate.format('YYYY-MM-DD'),
      page: page,
      limit: errorLogPagination.value.pageSize,
    });

    // 修正：确保分页 total 和 data 数量一致
    errorLogs.value = response.data || [];
    errorLogPagination.value.total = response.totalCount || errorLogs.value.length;
    errorLogPagination.value.current = page;

  } catch (error) {
    console.error(`Failed to fetch error logs for ${customerId}:`, error);
    message.error('Failed to load error logs');
    errorLogs.value = [];
    errorLogPagination.value.total = 0;
  } finally {
    errorLogLoading.value = false;
  }
};

// 新增: 处理错误日志表格分页/排序变化
const handleErrorLogTableChange = (pagination, filters, sorter) => {
  // 更新分页信息
  errorLogPagination.value.current = pagination.current;
  errorLogPagination.value.pageSize = pagination.pageSize;

  // 如果需要处理排序，可以在这里添加逻辑
  // const { field, order } = sorter;
  // console.log('Sorter:', field, order);

  // 重新获取当前页数据
  if (selectedCustomerId.value) {
    fetchErrorLogs(selectedCustomerId.value, pagination.current);
  }
};

// 新增: 处理错误日志日期范围变化
const handleErrorLogDateChange = () => {
  // 重置到第一页并重新获取数据
  errorLogPagination.value.current = 1;
  if (selectedCustomerId.value) {
    fetchErrorLogs(selectedCustomerId.value, 1);
  }
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

// 新增：SSE连接状态相关状态
const sseStatusLoading = ref(false)
const sseConnectionCount = ref(0)
const lastSSEUpdateTime = ref('')

// 新增：获取SSE连接状态
const fetchSSEStatus = async () => {
  sseStatusLoading.value = true
  try {
    // 假设API密钥从环境变量或配置中获取
    const apiKey = 'Mz7bHCyjvSqzOTfWHjUe6VO9kkSVnQvoxI2zgw3O894' // 这里需要替换为实际的API密钥
    const response = await api.getSubscriptionCount(apiKey)
    
    sseConnectionCount.value = response.connected_total || 0
    lastSSEUpdateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    
    console.log('SSE Status:', response)
  } catch (error) {
    console.error('Failed to fetch SSE status:', error)
    message.error('获取SSE连接状态失败')
    sseConnectionCount.value = 0
    lastSSEUpdateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  } finally {
    sseStatusLoading.value = false
  }
}

// 新增：客户统计相关状态
const customerStatisticLoading = ref(false)
const customerStatisticData = ref(null)

// 新增：获取客户统计信息
const fetchCustomerStatistic = async () => {
  customerStatisticLoading.value = true
  try {
    const response = await api.getCustomerStatistic()
    customerStatisticData.value = response
    console.log('Customer Statistic Data:', response)
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
    unsubscribeTaskOne: '未订阅，有成功生成页面的客户数', 
    unsubscribedNoTask: '未订阅，未跑过一次任务的客户数',
  }
  return labelMap[key] || key
}

// 新增：格式化统计值
const formatStatisticValue = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString() // 添加千分位分隔符
  }
  return value || '-'
}

// 新增：计算总注册数
const totalRegistrations = computed(() => {
  return registerStats.value.length
})

// 修改组件挂载时的初始化逻辑
onMounted(async () => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
  
  console.log('Component mounted, fetching initial data...')
  await fetchCustomerStatistic() // 新增：获取客户统计
  await fetchSSEStatus()
  await fetchErrorDashboardData()
  await fetchCustomerData()
  await fetchPackageList()
  await fetchRegisterStats()
  
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
</script>

<style scoped>
.initialization-container {
  padding: 16px;
  background: #f7f9fb;
  min-height: 100vh;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .initialization-container {
    padding: 12px 8px;
  }
}

.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  background: #fff;
  padding: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .section-card {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 8px;
  }
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

@media (min-width: 769px) {
  .section-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.section-title-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 16px;
  }
}

.header-actions-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.date-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.mobile-select {
  min-width: 120px;
  flex: 1;
}

@media (max-width: 768px) {
  .mobile-select {
    min-width: 100px;
  }
}

.mobile-search {
  width: 100%;
  max-width: 250px;
}

.title-and-summary-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.registration-summary-mobile {
  font-size: 13px;
  color: #555;
  background-color: #f0f2f5;
  padding: 6px 10px;
  border-radius: 4px;
}

.registration-summary-mobile .count {
  font-weight: bold;
  color: #1890ff;
  margin-left: 6px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .registration-summary-mobile .count {
    font-size: 18px;
  }
}

.invite-code-stats-mobile {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.invite-code-item {
  background-color: #e6f7ff;
  padding: 2px 6px;
  border-radius: 3px;
  color: #1890ff;
}

/* 移动端图表样式 */
.mobile-chart {
  height: 300px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .mobile-chart {
    height: 250px;
  }
}

/* 移动端客户列表样式 */
.mobile-customer-list {
  margin-top: 16px;
}

.customer-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.customer-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.customer-card.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.customer-email {
  font-weight: 600;
  color: #222;
  font-size: 14px;
}

.customer-status {
  font-size: 12px;
}

.error-indicator {
  color: #faad14;
}

.no-error-indicator {
  color: #52c41a;
}

.customer-details {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
}

.detail-item .value {
  color: #333;
  word-break: break-all;
}

.customer-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.customer-actions .ant-btn {
  font-size: 12px;
  height: 28px;
  padding: 0 8px;
}

/* 移动端错误日志样式 */
.mobile-error-list {
  margin-top: 16px;
}

.error-log-card {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  background: #fff;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.error-time {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.error-module {
  font-size: 12px;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  color: #333;
}

.error-operation {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.error-website {
  font-size: 12px;
  margin-bottom: 8px;
}

.error-website .label {
  color: #666;
  margin-right: 4px;
}

.error-website .value {
  color: #333;
  word-break: break-all;
}

.error-detail {
  font-size: 12px;
  color: #555;
  line-height: 1.4;
}

/* 移动端分页样式 */
.mobile-pagination {
  margin-top: 16px;
  text-align: center;
}

.mobile-pagination :deep(.ant-pagination) {
  justify-content: center;
}

.mobile-pagination :deep(.ant-pagination-item) {
  min-width: 28px;
  height: 28px;
  line-height: 26px;
  font-size: 12px;
}

/* 加载和空状态样式 */
.loading-container {
  text-align: center;
  padding: 40px 20px;
}

.empty-container {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .loading-container,
  .empty-container {
    padding: 30px 15px;
  }
}

/* 隐藏桌面端表格在移动端 */
@media (max-width: 768px) {
  .customer-table {
    display: none;
  }
}

/* 隐藏移动端列表在桌面端 */
@media (min-width: 769px) {
  .mobile-customer-list,
  .mobile-error-list {
    display: none;
  }
}

/* 保持原有桌面端样式 */
@media (min-width: 769px) {
  .initialization-container {
    padding: 32px 48px;
  }
  
  .section-card {
    padding: 24px 32px;
    margin-bottom: 32px;
  }
  
  .section-header {
    margin-bottom: 18px;
    padding-bottom: 8px;
  }
  
  .section-title {
    font-size: 20px;
    letter-spacing: 1px;
  }
  
  .title-and-summary-mobile {
    flex-direction: row;
    align-items: baseline;
    gap: 16px;
  }
  
  .registration-summary-mobile .count {
    font-size: 24px;
  }
}

/* 响应式图表配置 */
:deep(.echarts) {
  width: 100% !important;
}

/* 选中行样式 */
:deep(.selected-row) {
  background-color: #e6f7ff;
}

/* 表格行点击样式 */
.customer-table :deep(.ant-table-row) {
  cursor: pointer;
}

/* SSE状态样式 */
.sse-status-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 769px) {
  .sse-status-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.status-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.active-connections {
  font-size: 18px;
  color: #1890ff;
  background-color: #e6f7ff;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #91d5ff;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.status-indicator.offline {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.online .indicator-dot {
  background-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.status-indicator.offline .indicator-dot {
  background-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.indicator-text {
  font-size: 13px;
  font-weight: 500;
}

.status-indicator.online .indicator-text {
  color: #52c41a;
}

.status-indicator.offline .indicator-text {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .sse-status-content {
    gap: 8px;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .active-connections {
    font-size: 16px;
  }
  
  .status-indicator {
    align-self: stretch;
    justify-content: center;
  }
}

/* 客户统计样式 */
.statistic-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.statistic-grid-mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.statistic-grid-desktop {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.statistic-card-mobile {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.statistic-item-desktop {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px 24px;
  text-align: center;
  min-width: 180px;
}

.statistic-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.statistic-value {
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

@media (max-width: 768px) {
  .statistic-value {
    font-size: 20px;
  }
  
  .statistic-card-mobile {
    padding: 12px;
  }
}

/* 通知统计样式 */
.notification-stats-section {
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.stats-title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-bottom: 12px;
}

.notification-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.notification-stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
}

/* 筛选条件样式 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

@media (min-width: 769px) {
  .filter-section {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    margin-bottom: 0;
    margin-right: 16px;
  }
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  font-weight: 500;
}

.filter-select {
  min-width: 140px;
  flex: 1;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  
  .header-actions-mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

/* 突出显示的统计卡片样式 */
.highlight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.highlight-card .statistic-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.highlight-card .statistic-value {
  color: white;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.highlight-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.highlight-item .statistic-label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.highlight-item .statistic-value {
  color: white;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>