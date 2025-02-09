<template>
  <div class="package-config">
    <h2>Package Configuration</h2>
    <div class="package-config-content">
      <a-card>
        <a-button type="primary" @click="showAddModal" style="margin-bottom: 16px;">
          Add Package
        </a-button>
        
        <a-table :columns="columns" :data-source="packages" :row-key="record => record.packageFeatureId" :loading="loading">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="handleEdit(record)">Edit</a-button>
                <a-button type="link" danger @click="handleDelete(record)">Delete</a-button>
              </a-space>
            </template>
            <template v-if="column.key === 'active'">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? 'Active' : 'Inactive' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'price'">
              ${{ record.packagePrice }}
            </template>
          </template>
        </a-table>

        <!-- Add Trial Code Section -->
        <div style="margin-top: 24px;">
          <h3>Trial Code Management</h3>
          
          <!-- Create Trial Code Form -->
          <a-form layout="inline" :model="trialForm" style="margin-bottom: 16px;">
            <a-form-item label="Package">
              <a-select 
                v-model:value="trialForm.packageId" 
                style="width: 200px;"
                placeholder="Select package"
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
            <a-form-item label="Days">
              <a-input-number 
                v-model:value="trialForm.days" 
                :min="1" 
                style="width: 100px;"
              />
            </a-form-item>
            <a-form-item label="Name">
              <a-input 
                v-model:value="trialForm.name" 
                placeholder="Trial name"
                style="width: 200px;"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="createTrialCode">
                Generate Trial Code
              </a-button>
            </a-form-item>
          </a-form>

          <!-- Trial Codes Table -->
          <a-table 
            :columns="trialColumns" 
            :data-source="trialCodes" 
            :loading="trialLoading"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.active ? 'red' : 'green'">
                  {{ record.active ? 'Used' : 'Available' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button 
                  type="link" 
                  danger 
                  @click="handleDeleteTrial(record)"
                  :disabled="!record.active"
                >
                  Delete
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <a-modal
      v-model:open="modalVisible"
      :title="modalMode === 'add' ? 'Add Package' : 'Edit Package'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formState" :rules="rules" ref="formRef">
        <a-form-item label="Package Name" name="packageName">
          <a-input v-model:value="formState.packageName" />
        </a-form-item>
        <a-form-item label="Package Price" name="packagePrice">
          <a-input-number v-model:value="formState.packagePrice" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Package Type" name="packageType">
          <a-select v-model:value="formState.packageType">
            <a-select-option :value="1">Monthly</a-select-option>
            <a-select-option :value="2">Annual</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Outline Generation Limit" name="outlineGeneratorLimit">
          <a-input-number v-model:value="formState.outlineGeneratorLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Page Generation Limit" name="pageGeneratorLimit">
          <a-input-number v-model:value="formState.pageGeneratorLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Free Deployment Page Limit" name="freeDeploymentPageLimit">
          <a-input-number v-model:value="formState.freeDeploymentPageLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Internal Link Storage Limit" name="internalLinkStorageLimit">
          <a-input-number v-model:value="formState.internalLinkStorageLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Image Storage Limit" name="imageStorageLimit">
          <a-input-number v-model:value="formState.imageStorageLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Video Storage Limit" name="videoStorageLimit">
          <a-input-number v-model:value="formState.videoStorageLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Package Description" name="packageDescription">
          <a-textarea v-model:value="formState.packageDescription" placeholder="Enter package features, one per line" />
        </a-form-item>
        <a-form-item label="Additional Benefits" name="additionalBenefits">
          <a-button type="dashed" @click="addBenefit" block>
            <plus-outlined /> Add Benefit
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
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, h } from 'vue';
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
        console.log('Trial codes response:', response.data);
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
      totalPage: 0
    });

    const trialList = ref([]);

    const handleTableChange = (pag) => {
      pagination.value.current = pag.current;
      pagination.value.pageSize = pag.pageSize;
      fetchTrialCodes();
    };

    onMounted(() => {
      fetchPackages();
      fetchTrialCodes();
    });

    const formState = reactive({
      packageName: '',
      packagePrice: 0,
      packageType: 1,
      outlineGeneratorLimit: 0,
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
      outlineGeneratorLimit: [{ required: true, message: '请输入大纲生成限制' }],
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
      formState.outlineGeneratorLimit = 0;
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
            await api.createPackageFeature(formState);
            message.success('Package added successfully');
          } else {
            await api.updatePackageFeature(formState.packageFeatureId, formState);
            message.success('Package updated successfully');
          }
          modalVisible.value = false;
          fetchPackages();
        } catch (error) {
          message.error('操作失败: ' + error.message);
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
      handleTableChange,
      handleDeleteTrial,
    };
  },
};
</script>

<style scoped>
.package-config {
  padding: 24px;
}

.package-config-content {
  background: #fff;
  padding: 24px;
  min-height: 280px;
}
</style> 