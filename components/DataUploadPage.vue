<template>
  <div class="data-upload-container">
    <!-- SEMrush Keywords Data Section -->
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card title="SEMrush Keywords Data Upload" :bordered="false">
          <!-- Keywords Type Tabs -->
          <a-tabs v-model:activeKey="activeKeywordsType">
            <a-tab-pane v-for="type in keywordTypes" :key="type.key" :tab="type.label">
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
                :pagination="{ pageSize: 10 }"
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'

// Keywords types configuration
const keywordTypes = [
  { key: 'common', label: 'Common Keywords' },
  { key: 'missing', label: 'Missing Keywords' },
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
const keywordsColumns = []
const competitorsColumns = []

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
  keywordsLoading.value[type] = true
  try {
    // 这里添加文件解析和数据处理逻辑
    // const data = await parseFile(file)
    // keywordsData.value[type] = data
    message.success(`${type} keywords data uploaded successfully!`)
  } catch (error) {
    message.error('File processing failed: ' + error.message)
  } finally {
    keywordsLoading.value[type] = false
  }
}

const handleCompetitorsFile = async (file) => {
  competitorsLoading.value = true
  try {
    // 这里添加文件解析和数据处理逻辑
    // const data = await parseFile(file)
    // competitorsData.value = data
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
</script>

<style scoped>
.data-upload-container {
  padding: 24px;
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