<template>
  <div class="package-config" :class="{ 'mobile-layout': isMobile }">
    <div class="section-card">
      <div class="section-header">
        <span class="section-title">套餐配置</span>
        <a-button type="primary" @click="showAddModal" :size="isMobile ? 'middle' : 'default'">
          <PlusOutlined />
          添加套餐
        </a-button>
      </div>
      <div v-if="isMobile" class="mobile-package-list">
        <div v-if="loading" class="loading-container">
          <a-spin tip="加载套餐数据中..." />
        </div>
        <div v-else>
          <div 
            v-for="pkg in packages" 
            :key="pkg.packageFeatureId"
            class="package-card"
          >
            <div class="package-header">
              <div class="package-name">{{ pkg.packageName }}</div>
              <div class="package-price">${{ pkg.packagePrice }}</div>
            </div>
            
            <div class="package-details">
              <div class="detail-row">
                <span class="label">类型:</span>
                <span class="value">{{ pkg.packageType === 1 ? '月付' : '年付' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Stripe产品:</span>
                <span class="value">{{ getPriceProductName(pkg.priceId) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">状态:</span>
                <a-tag :color="pkg.active ? 'green' : 'red'">
                  {{ pkg.active ? '激活' : '未激活' }}
                </a-tag>
              </div>
              <div class="detail-row">
                <span class="label">更新时间:</span>
                <span class="value">{{ new Date(pkg.updatedAt).toLocaleDateString('zh-CN') }}</span>
              </div>
            </div>
            
            <div class="package-actions">
              <a-button type="default" size="small" @click="handleEdit(pkg)">
                编辑
              </a-button>
              <a-button type="primary" danger size="small" @click="handleDelete(pkg)">
                删除
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <a-table
        v-else
        :columns="columns"
        :data-source="packages"
        :row-key="record => record.packageFeatureId"
        :loading="loading"
        class="main-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'active'">
            <a-tag :color="record.active ? 'green' : 'red'">
              {{ record.active ? '激活' : '未激活' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'price'">
            ${{ record.packagePrice }}
          </template>
        </template>
      </a-table>
    </div>

    <div class="section-card" style="margin-top: 32px;">
      <div class="section-header">
        <span class="section-title">试用码管理</span>
      </div>
      <div v-if="isMobile" class="mobile-trial-form">
        <div class="form-group">
          <label>套餐</label>
          <a-select 
            v-model:value="trialForm.packageId" 
            placeholder="选择套餐"
            style="width: 100%;"
          >
            <a-select-option 
              v-for="pkg in packages" 
              :key="pkg.packageFeatureId" 
              :value="pkg.packageFeatureId"
            >
              {{ pkg.packageName }}
            </a-select-option>
          </a-select>
        </div>
        
        <div class="form-group">
          <label>天数</label>
          <a-input-number 
            v-model:value="trialForm.days" 
            :min="1" 
            style="width: 100%;"
          />
        </div>
        
        <div class="form-group">
          <label>名称</label>
          <a-input 
            v-model:value="trialForm.name" 
            placeholder="试用名称"
            style="width: 100%;"
          />
        </div>
        
        <div class="form-group">
          <a-button type="primary" @click="createTrialCode" block>
            生成试用码
          </a-button>
        </div>
      </div>
      <a-form v-else layout="inline" :model="trialForm" class="trial-form">
        <a-form-item label="套餐">
          <a-select 
            v-model:value="trialForm.packageId" 
            style="width: 200px;"
            placeholder="选择套餐"
          >
            <a-select-option 
              v-for="pkg in packages" 
              :key="pkg.packageFeatureId" 
              :value="pkg.packageFeatureId"
            >
              {{ pkg.packageName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="天数">
          <a-input-number 
            v-model:value="trialForm.days" 
            :min="1" 
            style="width: 100px;"
          />
        </a-form-item>
        <a-form-item label="名称">
          <a-input 
            v-model:value="trialForm.name" 
            placeholder="试用名称"
            style="width: 200px;"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="createTrialCode">
            生成试用码
          </a-button>
        </a-form-item>
      </a-form>
      <a-divider />
      <div v-if="isMobile" class="mobile-trial-list">
        <div v-if="trialLoading" class="loading-container">
          <a-spin tip="加载试用码中..." />
        </div>
        <div v-else>
          <div 
            v-for="trial in trialCodes" 
            :key="trial.trialId"
            class="trial-card"
          >
            <div class="trial-header">
              <div class="trial-code">{{ trial.inviteCode }}</div>
              <a-tag :color="trial.active ? 'green' : 'red'">
                {{ trial.active ? '可用' : '已使用' }}
              </a-tag>
            </div>
            
            <div class="trial-details">
              <div class="detail-row">
                <span class="label">试用名称:</span>
                <span class="value">{{ trial.trialName }}</span>
              </div>
              <div class="detail-row">
                <span class="label">天数:</span>
                <span class="value">{{ trial.duration }}</span>
              </div>
              <div class="detail-row">
                <span class="label">描述:</span>
                <span class="value">{{ trial.description || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">创建时间:</span>
                <span class="value">{{ new Date(trial.created_at).toLocaleDateString('zh-CN') }}</span>
              </div>
            </div>
            
            <div class="trial-actions">
              <a-button 
                type="primary" 
                danger 
                size="small"
                @click="handleDeleteTrial(trial)"
                :disabled="!trial.active"
              >
                删除
              </a-button>
            </div>
          </div>
          
          <div class="mobile-pagination">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :pageSize="pagination.pageSize"
              :showSizeChanger="false"
              :showQuickJumper="false"
              :showTotal="(total) => `共 ${total} 条`"
              @change="handlePaginationChange"
              size="small"
            />
          </div>
        </div>
      </div>
      <a-table 
        v-else
        :columns="trialColumns" 
        :data-source="trialCodes" 
        :loading="trialLoading"
        :pagination="pagination"
        class="main-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.active ? 'green' : 'red'">
              {{ record.active ? '可用' : '已使用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button 
              type="link" 
              danger 
              @click="handleDeleteTrial(record)"
              :disabled="!record.active"
            >
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="modalVisible"
      :title="modalMode === 'add' ? '添加套餐' : '编辑套餐'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :width="isMobile ? '95%' : '800px'"
      class="package-modal"
      :class="{ 'mobile-modal': isMobile }"
    >
      <div class="modal-content" :class="{ 'mobile-modal-content': isMobile }">
        <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
          <div class="form-row" :class="{ 'mobile-form-row': isMobile }">
            <a-form-item label="套餐名称" name="packageName">
              <a-input v-model:value="formState.packageName" />
            </a-form-item>
            <a-form-item label="套餐价格" name="packagePrice">
              <a-input-number v-model:value="formState.packagePrice" :min="0" style="width: 100%;" />
            </a-form-item>
          </div>
          
          <div class="form-row" :class="{ 'mobile-form-row': isMobile }">
            <a-form-item label="套餐类型" name="packageType">
              <a-select v-model:value="formState.packageType">
                <a-select-option :value="1">月付</a-select-option>
                <a-select-option :value="2">年付</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="价格ID" name="priceId">
              <a-select v-model:value="formState.priceId" placeholder="选择价格ID">
                <a-select-option v-for="price in priceList" :key="price.priceId" :value="price.priceId">
                  {{ price.productName }} ({{ price.productDesc }}) - ${{ (price.price / 100).toFixed(2) }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </div>
          
          <div class="limits-section">
            <h4>功能限制配置</h4>
            <div class="form-row" :class="{ 'mobile-form-row': isMobile }">
              <a-form-item label="手动大纲生成限制" name="manualOutlineGeneratorLimit">
                <a-input-number v-model:value="formState.manualOutlineGeneratorLimit" :min="0" style="width: 100%;" />
              </a-form-item>
              <a-form-item label="AI大纲生成限制" name="aiOutlineGeneratorLimit">
                <a-input-number v-model:value="formState.aiOutlineGeneratorLimit" :min="0" style="width: 100%;" />
              </a-form-item>
            </div>
            
            <div class="form-row" :class="{ 'mobile-form-row': isMobile }">
              <a-form-item label="页面生成限制" name="pageGeneratorLimit">
                <a-input-number v-model:value="formState.pageGeneratorLimit" :min="0" style="width: 100%;" />
              </a-form-item>
              <a-form-item label="免费部署页面限制" name="freeDeploymentPageLimit">
                <a-input-number v-model:value="formState.freeDeploymentPageLimit" :min="0" style="width: 100%;" />
              </a-form-item>
            </div>
            
            <div class="form-row" :class="{ 'mobile-form-row': isMobile }">
              <a-form-item label="内部链接存储限制" name="internalLinkStorageLimit">
                <a-input-number v-model:value="formState.internalLinkStorageLimit" :min="0" style="width: 100%;" />
              </a-form-item>
              <a-form-item label="图片存储限制" name="imageStorageLimit">
                <a-input-number v-model:value="formState.imageStorageLimit" :min="0" style="width: 100%;" />
              </a-form-item>
            </div>
            
            <a-form-item label="视频存储限制" name="videoStorageLimit">
              <a-input-number v-model:value="formState.videoStorageLimit" :min="0" style="width: 100%;" />
            </a-form-item>
          </div>
          
          <a-form-item label="套餐描述" name="packageDescription">
            <a-textarea v-model:value="formState.packageDescription" placeholder="输入套餐功能，每行一个" :rows="isMobile ? 3 : 4" />
          </a-form-item>
          
          <a-form-item label="额外福利" name="additionalBenefits">
            <a-button type="dashed" @click="addBenefit" block>
              <plus-outlined /> 添加福利
            </a-button>
            <div v-for="(benefit, index) in formState.additionalBenefits" :key="index" style="margin-top: 8px;">
              <a-input v-model:value="formState.additionalBenefits[index]">
                <template #suffix>
                  <minus-circle-outlined @click="removeBenefit(index)" style="cursor: pointer" />
                </template>
              </a-input>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, h, computed } from 'vue';
import { message, Modal, Tag } from 'ant-design-vue';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import { api } from '../api/api';

export default {
  name: 'PackageConfig',
  components: {
    PlusOutlined,
    MinusCircleOutlined,
  },
  setup() {
    const isMobile = ref(false);

    const checkDevice = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    onMounted(() => {
      checkDevice();
      window.addEventListener('resize', checkDevice);
      fetchPackages();
      fetchTrialCodes();
      fetchPriceList();
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkDevice);
    });

    const columns = [
      {
        title: 'Package Name',
        dataIndex: 'packageName',
        key: 'packageName',
      },
      {
        title: 'Price',
        dataIndex: 'packagePrice',
        key: 'price',
        customRender: ({ text }) => `$${text}`
      },
      {
        title: 'Stripe Product',
        dataIndex: 'priceId',
        key: 'stripeProduct',
        customRender: ({ text }) => {
          const price = priceList.value.find(p => p.priceId === text);
          return price ? `${price.productName} (${price.productDesc})` : text || 'Not linked';
        }
      },
      {
        title: 'Status',
        dataIndex: 'active',
        key: 'active',
        customRender: ({ text }) => h(Tag, {
          color: text ? 'green' : 'red'
        }, () => text ? 'Active' : 'Inactive')
      },
      {
        title: 'Updated At',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        customRender: ({ text }) => new Date(text).toLocaleString('en-US'),
      },
      {
        title: 'Actions',
        key: 'action',
        fixed: 'right',
        width: 120,
      },
    ];

    const packages = ref([]);
    const modalVisible = ref(false);
    const modalMode = ref('add');
    const formRef = ref(null);
    const loading = ref(false);

    const trialForm = reactive({
      packageId: undefined,
      days: 7,
      name: '',
    });

    const trialCodes = ref([]);
    const trialLoading = ref(false);

    const trialColumns = [
      {
        title: 'Trial Code',
        dataIndex: 'inviteCode',
        key: 'code',
      },
      {
        title: 'Trial Name',
        dataIndex: 'trialName',
        key: 'trialName',
      },
      {
        title: 'Duration (Days)',
        dataIndex: 'duration',
        key: 'days',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Status',
        dataIndex: 'active',
        key: 'status',
        customRender: ({ text }) => h(Tag, {
          color: text ? 'green' : 'red'
        }, () => text ? 'Available' : 'Used')
      },
      {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'createdAt',
        customRender: ({ text }) => new Date(text).toLocaleString('en-US'),
      },
      {
        title: 'Action',
        key: 'action',
        fixed: 'right',
        width: 100,
      },
    ];

    const fetchPackages = async () => {
      loading.value = true;
      try {
        const response = await api.getPackageFeatures();
        packages.value = response.data;
      } catch (error) {
        message.error('Failed to load packages: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    const fetchTrialCodes = async () => {
      trialLoading.value = true;
      try {
        const params = {
          page: pagination.value.current,
          limit: pagination.value.pageSize
        };
        const response = await api.getTrialPackages(params);
        trialCodes.value = response.data;
        pagination.value.total = response.total;
        pagination.value.totalPage = response.totalPage;
      } catch (error) {
        message.error('Failed to fetch trial codes: ' + error.message);
      } finally {
        trialLoading.value = false;
      }
    };

    const pagination = ref({
      current: 1,
      pageSize: 10,
      total: 0,
      totalPage: 0,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} items`,
      onChange: (page, pageSize) => {
        pagination.value.current = page;
        pagination.value.pageSize = pageSize;
        fetchTrialCodes();
      },
      onShowSizeChange: (current, size) => {
        pagination.value.current = 1;
        pagination.value.pageSize = size;
        fetchTrialCodes();
      }
    });

    const trialList = ref([]);

    const priceList = ref([]);

    const fetchPriceList = async () => {
      try {
        const response = await api.getPriceList();
        priceList.value = response.data || [];
      } catch (error) {
        message.error('获取价格列表失败: ' + error.message);
      }
    };

    const formState = reactive({
      packageName: '',
      packagePrice: 0,
      packageType: 1,
      priceId: undefined,
      manualOutlineGeneratorLimit: 0,
      aiOutlineGeneratorLimit: 0,
      pageGeneratorLimit: 0,
      freeDeploymentPageLimit: 0,
      internalLinkStorageLimit: 0,
      imageStorageLimit: 0,
      videoStorageLimit: 0,
      packageDescription: '',
      additionalBenefits: [],
      active: true
    });

    const rules = {
      packageName: [{ required: true, message: '请输入套餐名称' }],
      packagePrice: [{ required: true, message: '请输入套餐价格' }],
      packageType: [{ required: true, message: '请选择套餐类型' }],
      priceId: [{ required: true, message: '请选择价格ID' }],
      manualOutlineGeneratorLimit: [{ required: true, message: '请输入手动大纲生成限制' }],
      aiOutlineGeneratorLimit: [{ required: true, message: '请输入AI大纲生成限制' }],
      pageGeneratorLimit: [{ required: true, message: '请输入页面生成限制' }],
      freeDeploymentPageLimit: [{ required: true, message: '请输入免费部署页面限制' }],
      internalLinkStorageLimit: [{ required: true, message: '请输入内部链接存储限制' }],
      imageStorageLimit: [{ required: true, message: '请输入图片存储限制' }],
      videoStorageLimit: [{ required: true, message: '请输入视频存储限制' }],
      packageDescription: [{ required: true, message: '请输入套餐描述' }],
    };

    const showAddModal = () => {
      modalMode.value = 'add';
      formState.packageName = '';
      formState.packagePrice = 0;
      formState.packageType = 1;
      formState.priceId = undefined;
      formState.manualOutlineGeneratorLimit = 0;
      formState.aiOutlineGeneratorLimit = 0;
      formState.pageGeneratorLimit = 0;
      formState.freeDeploymentPageLimit = 0;
      formState.internalLinkStorageLimit = 0;
      formState.imageStorageLimit = 0;
      formState.videoStorageLimit = 0;
      formState.packageDescription = '';
      formState.additionalBenefits = [];
      formState.active = true;
      modalVisible.value = true;
    };

    const handleEdit = (record) => {
      modalMode.value = 'edit';
      Object.assign(formState, record);
      modalVisible.value = true;
    };

    const handleDelete = (record) => {
      Modal.confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete package "${record.packageName}"?`,
        okText: 'Confirm',
        cancelText: 'Cancel',
        async onOk() {
          try {
            await api.deletePackageFeature(record.packageFeatureId);
            message.success('Package deleted successfully');
            fetchPackages();
          } catch (error) {
            message.error('Delete failed: ' + error.message);
          }
        },
      });
    };

    const handleModalOk = () => {
      formRef.value.validate().then(async () => {
        try {
          if (modalMode.value === 'add') {
            const response = await api.createPackageFeature(formState);
            if (response && response.code === 400) {
              message.error('Failed to add package: ' + (response.message || 'Invalid request'));
              return;
            }
            message.success('Package added successfully');
          } else {
            const response = await api.updatePackageFeature(formState.packageFeatureId, formState);
            if (response && response.code === 400) {
              message.error('Failed to update package: ' + (response.message || 'Invalid request'));
              return;
            }
            message.success('Package updated successfully');
          }
          modalVisible.value = false;
          fetchPackages();
        } catch (error) {
          console.error('Operation failed:', error);
          message.error('Operation failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        }
      });
    };

    const handleModalCancel = () => {
      modalVisible.value = false;
    };

    const addBenefit = () => {
      formState.additionalBenefits.push('');
    };

    const removeBenefit = (index) => {
      formState.additionalBenefits.splice(index, 1);
    };

    const createTrialCode = async () => {
      if (!trialForm.packageId || !trialForm.days || !trialForm.name) {
        message.error('Please fill in all required fields');
        return;
      }

      try {
        const trialData = {
          packageId: trialForm.packageId,
          trailDays: trialForm.days,
          trialName: trialForm.name
        };
        await api.applyTrialPackage(trialData);
        message.success('Trial code created successfully');
        fetchTrialCodes();
        trialForm.name = '';
      } catch (error) {
        message.error('Failed to create trial code: ' + error.message);
      }
    };

    const handleDeleteTrial = (record) => {
      console.log('Trial record:', record);
      
      const trialId = record.trialId;
      
      if (!trialId) {
        message.error('Invalid trial ID');
        return;
      }

      Modal.confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete trial code "${record.inviteCode}"?`,
        okText: 'Confirm',
        cancelText: 'Cancel',
        async onOk() {
          try {
            await api.deleteTrialPackage(trialId);
            message.success('Trial code deleted successfully');
            fetchTrialCodes();
          } catch (error) {
            message.error('Delete failed: ' + error.message);
          }
        },
      });
    };

    const getPriceProductName = (priceId) => {
      const price = priceList.value.find(p => p.priceId === priceId);
      return price ? `${price.productName} (${price.productDesc})` : 'Not linked';
    };

    const handlePaginationChange = (page, pageSize) => {
      pagination.value.current = page;
      pagination.value.pageSize = pageSize;
      fetchTrialCodes();
    };

    return {
      columns,
      packages,
      modalVisible,
      modalMode,
      formRef,
      formState,
      rules,
      loading,
      showAddModal,
      handleEdit,
      handleDelete,
      handleModalOk,
      handleModalCancel,
      addBenefit,
      removeBenefit,
      trialForm,
      trialCodes,
      trialLoading,
      trialColumns,
      createTrialCode,
      pagination,
      trialList,
      fetchTrialCodes,
      handleDeleteTrial,
      priceList,
      fetchPriceList,
      getPriceProductName,
      isMobile,
      handlePaginationChange,
    };
  },
};
</script>

<style scoped>
.package-config {
  padding: 32px 48px;
  background: #f7f9fb;
  min-height: 100vh;
}

.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  background: #fff;
  padding: 24px 32px;
  margin-bottom: 0;
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

.trial-form {
  margin-bottom: 16px;
  gap: 16px;
}

.main-table {
  margin-top: 8px;
}

.package-modal :deep(.ant-modal-content) {
  border-radius: 12px;
}

:deep(.ant-table-tbody > tr) {
  cursor: pointer;
}

.mobile-layout {
  padding: 0;
}

.mobile-layout .section-card {
  margin: 0 0 16px 0;
  border-radius: 0;
  box-shadow: none;
  border-bottom: 8px solid #f5f5f5;
}

.mobile-package-list {
  margin-top: 16px;
}

.package-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.package-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.package-price {
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
}

.package-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row .label {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.detail-row .value {
  color: #333;
  text-align: right;
  word-break: break-all;
}

.package-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.mobile-trial-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.mobile-trial-list {
  margin-top: 16px;
}

.trial-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
}

.trial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trial-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.trial-details {
  margin-bottom: 16px;
}

.trial-actions {
  display: flex;
  justify-content: flex-end;
}

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

.mobile-modal {
  margin: 0;
  padding-top: 20px;
  max-width: none;
}

.mobile-modal :deep(.ant-modal-content) {
  margin: 0;
  border-radius: 8px 8px 0 0;
}

.mobile-modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mobile-form-row {
  grid-template-columns: 1fr;
  gap: 0;
}

.limits-section {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background: #fafafa;
}

.limits-section h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.loading-container {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .section-header .ant-btn {
    width: 100%;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .main-table {
    display: none;
  }
  
  .trial-form {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-package-list,
  .mobile-trial-form,
  .mobile-trial-list {
    display: none;
  }
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.main-table {
  margin-top: 16px;
}

.trial-form {
  margin-bottom: 20px;
}

.package-modal :deep(.ant-modal-content) {
  border-radius: 12px;
}
</style> 