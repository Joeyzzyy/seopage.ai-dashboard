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
          </template>
        </a-table>
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
        <a-form-item label="Monthly Price" name="monthPrice">
          <a-input-number v-model:value="formState.monthPrice" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Annual Price" name="annualPrice">
          <a-input-number v-model:value="formState.annualPrice" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Monthly Outline Generation Limit" name="monthlyOutlineGeneratorLimit">
          <a-input-number v-model:value="formState.monthlyOutlineGeneratorLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Monthly Page Generation Limit" name="monthPageGeneratorLimit">
          <a-input-number v-model:value="formState.monthPageGeneratorLimit" :min="0" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="Annual Page Generation Limit" name="annualPageGeneratorLimit">
          <a-input-number v-model:value="formState.annualPageGeneratorLimit" :min="0" style="width: 100%;" />
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
        title: 'Monthly Price',
        dataIndex: 'monthPrice',
        key: 'monthPrice',
        customRender: ({ text }) => `$${text}`
      },
      {
        title: 'Annual Price',
        dataIndex: 'annualPrice',
        key: 'annualPrice',
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
        dataIndex: 'updated',
        key: 'updated',
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

    onMounted(() => {
      fetchPackages();
    });

    const formState = reactive({
      packageName: '',
      monthPrice: 0,
      annualPrice: 0,
      monthlyOutlineGeneratorLimit: 0,
      monthPageGeneratorLimit: 0,
      annualPageGeneratorLimit: 0,
      freeDeploymentPageLimit: 0,
      internalLinkStorageLimit: 0,
      imageStorageLimit: 0,
      videoStorageLimit: 0,
      packageDescription: '',
      additionalBenefits: [],
    });

    const rules = {
      packageName: [{ required: true, message: 'Please enter package name' }],
      monthPrice: [{ required: true, message: 'Please enter monthly price' }],
      annualPrice: [{ required: true, message: 'Please enter annual price' }],
      monthlyOutlineGeneratorLimit: [{ required: true, message: 'Please enter monthly outline generation limit' }],
      monthPageGeneratorLimit: [{ required: true, message: 'Please enter monthly page generation limit' }],
      annualPageGeneratorLimit: [{ required: true, message: 'Please enter annual page generation limit' }],
      freeDeploymentPageLimit: [{ required: true, message: 'Please enter free deployment page limit' }],
      internalLinkStorageLimit: [{ required: true, message: 'Please enter internal link storage limit' }],
      imageStorageLimit: [{ required: true, message: 'Please enter image storage limit' }],
      videoStorageLimit: [{ required: true, message: 'Please enter video storage limit' }],
      packageDescription: [{ required: true, message: 'Please enter package description' }],
      additionalBenefits: [{ required: true, message: 'Please enter additional benefits' }],
    };

    const showAddModal = () => {
      modalMode.value = 'add';
      formState.packageName = '';
      formState.monthPrice = 0;
      formState.annualPrice = 0;
      formState.monthlyOutlineGeneratorLimit = 0;
      formState.monthPageGeneratorLimit = 0;
      formState.annualPageGeneratorLimit = 0;
      formState.freeDeploymentPageLimit = 0;
      formState.internalLinkStorageLimit = 0;
      formState.imageStorageLimit = 0;
      formState.videoStorageLimit = 0;
      formState.packageDescription = '';
      formState.additionalBenefits = [];
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