<template>
  <div class="initialization-container">
    <a-row :gutter="[12, 12]">
      <a-col :span="24">
        <a-card title="Customers Requiring Data Initialization">
          <a-table
            :columns="initializationColumns"
            :data-source="customers"
            :pagination="pagination"
            :loading="loading"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="default" size="small" @click="handleEditPlan(record)">
                    Edit Plan
                  </a-button>
                  <a-button type="primary" size="small" @click="handleInitialize(record)">
                    Initialize
                  </a-button>
                </a-space>
              </template>
              <template v-if="column.key === 'competeProduct'">
                {{ formatCompeteProducts(record.competeProduct) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- Add Modal -->
    <a-modal
      v-model:visible="modalVisible"
      title="Trial Package Details"
      :footer="null"
      width="600px"
    >
      <div v-if="selectedPackage" class="package-form">
        <a-form :model="selectedPackage" layout="vertical">
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
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { api } from '../api/api'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

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

const initializationColumns = [
  {
    title: 'Customer ID',
    dataIndex: 'customerId',
    key: 'customerId',
  },
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
      competeProduct: item.competeProduct || '-',
      email: item.email || '-'
    }))
    
    pagination.value.total = response.TotalCount
    pagination.value.current = page
  } catch (error) {
    console.error('Failed to fetch customer list:', error)
    message.error('获取客户列表失败')
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

// Add new refs
const modalVisible = ref(false)
const packageLoading = ref(false)
const packageList = ref([])

const handleDateChange = (record, field, date) => {
  if (date) {
    record[field] = dayjs(date)
  } else {
    record[field] = null
  }
  console.log('Date changed:', { record, field, date })
}

const selectedPackage = ref(null)
const saving = ref(false)

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

// 修改 handleSave 函数
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

const formatCompeteProducts = (text) => {
  if (!text) return '-'
  return text.split(',')
    .map(item => item.split('|')[0])
    .join(', ')
}

// 修改分页变化处理函数
const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  fetchCustomerData(pag.current)
}

onMounted(() => {
  fetchCustomerData()
  fetchPackageList() // 初始化时获取套餐列表
})
</script>

<style scoped>
.initialization-container {
  padding: 24px;
}

.package-form {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 16px;
}

.no-package-message {
  text-align: center;
  padding: 24px;
}
</style> 