<template>
  <PageLayout 
    title="组件配置" 
    description="管理组件分类和组件，支持增删改查操作"
    icon="⚙️"
  >
    <template #header-right>
      <a-space>
        <a-button @click="showAddCategoryModal">
          <template #icon>
            <PlusOutlined />
          </template>
          新增分类
        </a-button>
        <a-button type="primary" :disabled="!activeCategoryId" @click="showAddComponentModal">
          <template #icon>
            <PlusOutlined />
          </template>
          新增组件
        </a-button>
      </a-space>
    </template>

    <div class="component-config-container">
      <!-- 分类 Tab 区域 -->
      <div class="category-tabs-section">
        <div class="section-header">
          <h3>组件分类</h3>
          <a-button type="link" @click="refreshCategories">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
        </div>
        
        <a-tabs
          v-model:activeKey="activeCategoryId"
          type="card"
          :tabBarStyle="{ marginBottom: 0 }"
          @change="handleCategoryChange"
        >
          <a-tab-pane
            v-for="category in categories"
            :key="category.id"
            :tab="category.name"
          >
            <template #tab>
              <div class="tab-content">
                <span>{{ category.name }}</span>
                <a-dropdown :trigger="['click']" placement="bottomRight">
                  <a-button type="text" size="small" @click.stop>
                    <MoreOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="edit" @click="editCategory(category)">
                        <EditOutlined />
                        编辑
                      </a-menu-item>
                      <a-menu-item key="delete" @click="deleteCategory(category)">
                        <DeleteOutlined />
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 组件管理区域 -->
      <div class="component-section" v-if="activeCategoryId">
        <div class="section-header">
          <h3>组件列表</h3>
          <div class="component-actions">
            <a-button 
              type="primary" 
              @click="showAddComponentModal"
            >
              <template #icon>
                <PlusOutlined />
              </template>
              新增组件
            </a-button>
            <a-button 
              type="default" 
              @click="openImportModal"
              style="margin-left: 8px;"
            >
              <template #icon>
                <ImportOutlined />
              </template>
              导入组件
            </a-button>
          </div>
        </div>

        <!-- 组件卡片列表 -->
         <div class="component-cards-container" v-if="components.length > 0">
           <div 
             class="component-card" 
             v-for="component in components" 
             :key="component.id"
           >
             <div class="card-header">
               <div class="card-title">
                 <h4>{{ component.name }}</h4>
                 <a-tag :color="component.is_active ? 'green' : 'red'">
                   {{ component.is_active ? '激活' : '禁用' }}
                 </a-tag>
               </div>
               <div class="card-actions">
                 <a-button type="primary" size="small" @click="previewComponent(component)">
                   <template #icon>
                     <PlayCircleOutlined />
                   </template>
                   预览
                 </a-button>
                 <a-button size="small" @click="editComponent(component)">
                   <template #icon>
                     <EditOutlined />
                   </template>
                   编辑
                 </a-button>
                 <a-button size="small" @click="viewComponent(component)">
                   <template #icon>
                     <EyeOutlined />
                   </template>
                   查看
                 </a-button>
                 <a-button size="small" danger @click="deleteComponent(component)">
                   <template #icon>
                     <DeleteOutlined />
                   </template>
                   删除
                 </a-button>
               </div>
             </div>
            
             <div class="card-content">
               <p class="description">{{ component.description }}</p>
               
               <div class="tags-section" v-if="component.tags && component.tags.length > 0">
                 <a-tag v-for="tag in component.tags" :key="tag" color="blue">
                   {{ tag }}
                 </a-tag>
               </div>
               
               <div class="html-preview">
                 <div class="preview-label">HTML模板预览：</div>
                 <div class="code-preview">
                   {{ component.html_template && component.html_template.length > 150 
                       ? component.html_template.substring(0, 150) + '...' 
                       : component.html_template }}
                 </div>
               </div>
             </div>
             
            
            <div class="card-footer">
              <div class="card-meta">
                <span class="sort-order">排序: {{ component.sort_order }}</span>
                <span class="created-time">{{ formatDate(component.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-components">
          <a-empty description="暂无组件，点击上方按钮创建组件" />
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="componentPagination.total > 0">
          <a-pagination
            v-model:current="componentPagination.current"
            v-model:page-size="componentPagination.pageSize"
            :total="componentPagination.total"
            :show-size-changer="true"
            :show-quick-jumper="true"
            :show-total="(total) => '共 ' + total + ' 条记录'"
            @change="handleComponentTableChange"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <a-empty description="请先创建分类或选择分类查看组件" />
      </div>
    </div>

    <!-- 分类编辑模态框 -->
    <a-modal
      v-model:open="showCategoryModal"
      :title="editingCategory ? '编辑分类' : '新增分类'"
      @ok="saveCategory"
      @cancel="cancelCategoryEdit"
    >
      <a-form
        :model="categoryForm"
        :rules="categoryRules"
        ref="categoryFormRef"
        layout="vertical"
      >
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="categoryForm.name" placeholder="请输入分类名称" />
        </a-form-item>
        <a-form-item label="分类描述" name="description">
          <a-textarea 
            v-model:value="categoryForm.description" 
            placeholder="请输入分类描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 组件编辑模态框 -->
    <a-modal
      v-model:open="showComponentModal"
      :title="editingComponent ? '编辑组件' : '新增组件'"
      width="800px"
      @ok="saveComponent"
      @cancel="cancelComponentEdit"
    >
      <a-form
        :model="componentForm"
        :rules="componentRules"
        ref="componentFormRef"
        layout="vertical"
      >
        <a-form-item label="组件名称" name="name">
          <a-input v-model:value="componentForm.name" placeholder="请输入组件名称" />
        </a-form-item>
        <a-form-item label="组件描述" name="description">
          <a-textarea 
            v-model:value="componentForm.description" 
            placeholder="请输入组件描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="HTML模板" name="html_template">
          <a-textarea 
            v-model:value="componentForm.html_template" 
            placeholder="请输入HTML模板代码"
            :rows="10"
          />
        </a-form-item>
        <a-form-item label="数据格式" name="data_format">
          <a-textarea 
            v-model:value="componentForm.data_format" 
            placeholder="请输入数据格式，如：{'title': 'string', 'subtitle': 'string'}"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="componentForm.tags"
            mode="tags"
            placeholder="请输入标签，按回车添加"
            style="width: 100%"
          />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="是否激活" name="is_active">
              <a-switch v-model:checked="componentForm.is_active" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序顺序" name="sort_order">
              <a-input-number 
                v-model:value="componentForm.sort_order" 
                :min="1" 
                :max="999"
                placeholder="排序顺序"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 组件查看模态框 -->
    <a-modal
      v-model:open="showComponentViewModal"
      title="组件详情"
      width="800px"
      :footer="null"
    >
      <div class="component-view">
        <h4>{{ viewingComponent?.name }}</h4>
        <p><strong>描述：</strong>{{ viewingComponent?.description }}</p>
        <div v-if="viewingComponent?.data_format">
          <p><strong>数据格式：</strong>{{ viewingComponent.data_format }}</p>
        </div>
        <div v-if="viewingComponent?.tags && viewingComponent.tags.length > 0">
          <p><strong>标签：</strong>{{ viewingComponent.tags.join(', ') }}</p>
        </div>
        <div class="code-view">
          <strong>HTML模板：</strong>
          <pre><code>{{ viewingComponent?.html_template }}</code></pre>
        </div>
      </div>
    </a-modal>

    <!-- 导入组件模态框 -->
    <a-modal
      v-model:open="showImportModal"
      title="导入组件"
      width="800px"
      :footer="null"
    >
      <div class="import-container">
        <div v-if="importStep === 'upload'">
          <p class="mb-4">请选择包含组件的HTML文件进行导入。文件应包含以注释形式标记的组件定义和HTML模板。</p>
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept=".html,.htm"
              @change="handleFileSelected"
            />
            <div class="upload-box" @click="triggerFileSelect">
              <FileOutlined style="font-size: 48px; color: #d9d9d9; margin-bottom: 16px;" />
              <p>点击选择HTML文件</p>
              <p class="text-gray">支持 .html, .htm 格式</p>
            </div>
          </div>
        </div>
        
        <div v-if="importStep === 'preview'">
          <div class="preview-header">
            <h3>解析到 {{ parsedComponents.length }} 个组件</h3>
            <div class="preview-actions">
              <a-button type="primary" @click="importComponents" :loading="importing">
                <template #icon>
                  <CheckCircleOutlined />
                </template>
                确认导入
              </a-button>
              <a-button @click="cancelImport" style="margin-left: 8px;">
                <template #icon>
                  <CloseCircleOutlined />
                </template>
                取消
              </a-button>
            </div>
          </div>
          
          <a-table
            :columns="previewColumns"
            :data-source="parsedComponents"
            :pagination="{ pageSize: 5 }"
            :row-key="record => record.name"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <span>{{ record.name }}</span>
              </template>
              <template v-if="column.key === 'description'">
                <span>{{ record.description.length > 50 ? record.description.substring(0, 50) + '...' : record.description }}</span>
              </template>
              <template v-if="column.key === 'html_template'">
                <span>{{ record.html_template.length > 50 ? record.html_template.substring(0, 50) + '...' : record.html_template }}</span>
              </template>
              <template v-if="column.key === 'tags'">
                <a-tag v-for="tag in record.tags" :key="tag" color="blue">{{ tag }}</a-tag>
              </template>
            </template>
          </a-table>
        </div>
        
        <div v-if="importStep === 'result'">
          <div class="result-container">
            <div v-if="importSuccess">
              <div class="success-icon">
                <CheckCircleOutlined style="font-size: 48px; color: #52c41a;" />
              </div>
              <h3>导入成功</h3>
              <p>成功导入 {{ successCount }} 个组件</p>
            </div>
            <div v-else>
              <div class="error-icon">
                <CloseCircleOutlined style="font-size: 48px; color: #f5222d;" />
              </div>
              <h3>导入失败</h3>
              <p>{{ importError }}</p>
            </div>
            <div class="result-actions">
              <a-button type="primary" @click="closeImport">
                确定
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
    
    <!-- 组件预览模态框 -->
    <a-modal
      v-model:open="showComponentPreviewModal"
      :title="'预览组件 - ' + (previewingComponent?.name || '')"
      width="95%"
      :footer="null"
      :bodyStyle="{ padding: 0, height: '80vh' }"
    >
      <div class="component-preview-container">
        <div class="preview-header">
          <div class="preview-controls">
            <a-button @click="togglePreviewMode" :type="previewMode === 'desktop' ? 'primary' : 'default'">
              <template #icon>
                <DesktopOutlined />
              </template>
              桌面预览
            </a-button>
            <a-button @click="togglePreviewMode" :type="previewMode === 'mobile' ? 'primary' : 'default'">
              <template #icon>
                <MobileOutlined />
              </template>
              移动预览
            </a-button>
            <a-button @click="refreshPreview">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
          </div>
        </div>
        <div class="preview-content" :class="{ 'mobile-preview': previewMode === 'mobile' }">
          <iframe
            ref="previewIframe"
            :src="previewUrl"
            class="preview-iframe"
            @load="onPreviewLoad"
          ></iframe>
        </div>
      </div>
    </a-modal>
  </PageLayout>
</template>

<script>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  PlusOutlined, 
  ReloadOutlined, 
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  DesktopOutlined,
  MobileOutlined,
  PlayCircleOutlined,
  ImportOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import PageLayout from './layout/PageLayout.vue'
import { api } from '../api/api'
import { createPreviewHTML } from '../utils/previewGenerator.js'
import { parseComponentsFromHTML, validateComponent } from '../utils/componentParser.js'

export default {
  name: 'ComponentConfig',
  components: {
    PageLayout,
    PlusOutlined,
    ReloadOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DesktopOutlined,
    MobileOutlined,
    PlayCircleOutlined,
    ImportOutlined,
    FileOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
  },
  setup() {
    // 响应式数据
    const categories = ref([])
    const components = ref([])
    const categoryLoading = ref(false)
    const componentLoading = ref(false)
    const activeCategoryId = ref(null)
    
    // 模态框状态
    const showCategoryModal = ref(false)
    const showComponentModal = ref(false)
    const showComponentViewModal = ref(false)
    const showComponentPreviewModal = ref(false)
    const showImportModal = ref(false)
    
    // 编辑状态
    const editingCategory = ref(null)
    const editingComponent = ref(null)
    const viewingComponent = ref(null)
    const previewingComponent = ref(null)
    
    // 预览相关
    const previewMode = ref('desktop')
    const previewUrl = ref('')
    const previewIframe = ref(null)
    
    // 导入相关
    const fileInput = ref(null)
    const importStep = ref('upload') // upload, preview, result
    const parsedComponents = ref([])
    const importing = ref(false)
    const importSuccess = ref(false)
    const successCount = ref(0)
    const importError = ref('')
    
    // 导入预览表格列定义
    const previewColumns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'HTML模板',
        dataIndex: 'html_template',
        key: 'html_template',
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
      }
    ]
    
    
    // 表单数据 - 分类表单
    const categoryForm = reactive({
      name: '',
      description: '',
      icon: '',
      is_active: true,
      sort_order: 1
    })
    
    // 表单数据 - 更新组件表单结构
    const componentForm = reactive({
      name: '',
      description: '',
      html_template: '',  // 将 code 改为 html_template
      data_format: '',    // 新增数据格式字段
      tags: [],          // 新增标签字段
      is_active: true,   // 新增激活状态
      sort_order: 1      // 新增排序字段
    })
    
    // 分页配置
    const componentPagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `共 ${total} 条记录`
    })
    
    // 表格列配置
    const componentColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80
      },
      {
        title: '组件名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: 200
      },
      {
        title: 'HTML模板',
        dataIndex: 'html_template',
        key: 'html_template',
        width: 300
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        width: 150,
        customRender: ({ record }) => {
          return record.tags ? record.tags.join(', ') : ''
        }
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        key: 'is_active',
        width: 80,
        customRender: ({ record }) => {
          return record.is_active ? '激活' : '禁用'
        }
      },
      {
        title: '排序',
        dataIndex: 'sort_order',
        key: 'sort_order',
        width: 80
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180
      },
      {
        title: '操作',
        key: 'action',
        width: 200
      }
    ]
    
    // 表单验证规则 - 分类验证规则
    const categoryRules = {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' }
      ],
      icon: [
        { required: true, message: '请输入图标名称', trigger: 'blur' }
      ],
      sort_order: [
        { required: true, message: '请输入排序顺序', trigger: 'blur' },
        { type: 'number', message: '排序顺序必须为数字', trigger: 'blur' }
      ]
    }
    
    // 表单验证规则 - 更新组件验证规则
    const componentRules = {
      name: [
        { required: true, message: '请输入组件名称', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入组件描述', trigger: 'blur' }
      ],
      html_template: [
        { required: true, message: '请输入HTML模板', trigger: 'blur' }
      ]
    }
    
    // 表单引用
    const categoryFormRef = ref()
    const componentFormRef = ref()
    
    // 加载分类列表
    const loadCategories = async () => {
      try {
        categoryLoading.value = true
        const response = await api.getComponentCategories()
        // 适配新的 API 响应格式 - 根据实际数据结构
        categories.value = response.items || response.data || response || []
        
        // 如果有分类且没有选中的分类，自动选择第一个
        if (categories.value.length > 0 && !activeCategoryId.value) {
          activeCategoryId.value = categories.value[0].id
        }
      } catch (error) {
        message.error('加载分类列表失败')
        console.error('Load categories error:', error)
      } finally {
        categoryLoading.value = false
      }
    }
    
    // 加载组件列表 - 使用新的 getComponentsByCategory 接口
    const loadComponents = async (page = 1, pageSize = 10) => {
      if (!activeCategoryId.value) {
        components.value = []
        return
      }
      
      try {
        componentLoading.value = true
        const response = await api.getComponentsByCategory(activeCategoryId.value, {
          page,
          limit: pageSize
        })
        // 适配新的 API 响应格式 - 根据实际数据结构
        components.value = response.items || response.data || response || []
        componentPagination.total = response.meta?.total || response.total || response.count || 0
        componentPagination.current = page
        componentPagination.pageSize = pageSize
      } catch (error) {
        message.error('加载组件列表失败')
        console.error('Load components error:', error)
      } finally {
        componentLoading.value = false
      }
    }
    
    // 处理分类切换
    const handleCategoryChange = (categoryId) => {
      activeCategoryId.value = categoryId
      componentPagination.current = 1
      loadComponents(1, componentPagination.pageSize)
    }
    
    // 刷新分类
    const refreshCategories = () => {
      loadCategories()
    }
    
    // 显示新增分类模态框
    const showAddCategoryModal = () => {
      // 清空表单
      editingCategory.value = null
      categoryForm.name = ''
      categoryForm.description = ''
      categoryForm.icon = ''
      categoryForm.is_active = true
      categoryForm.sort_order = 1
      // 重置表单验证状态
      if (categoryFormRef.value) {
        categoryFormRef.value.resetFields()
      }
      // 显示模态框
      showCategoryModal.value = true
    }
    
    // 编辑分类
    const editCategory = (record) => {
      editingCategory.value = record
      categoryForm.name = record.name
      categoryForm.description = record.description || ''
      categoryForm.icon = record.icon || ''
      categoryForm.is_active = record.is_active !== undefined ? record.is_active : true
      categoryForm.sort_order = record.sort_order || 1
      showCategoryModal.value = true
    }
    
    // 删除分类 - 完善删除逻辑
    const deleteCategory = (record) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除分类 "${record.name}" 吗？删除后该分类下的所有组件也将被删除。`,
        onOk: async () => {
          try {
            await api.deleteComponentCategory(record.id)
            message.success('删除成功')
            
            // 如果删除的是当前选中的分类，清空组件列表并重新选择分类
            if (activeCategoryId.value === record.id) {
              activeCategoryId.value = null
              components.value = []
              
              // 重新加载分类列表，如果还有其他分类，自动选择第一个
              await loadCategories()
              if (categories.value.length > 0) {
                activeCategoryId.value = categories.value[0].id
              }
            } else {
              // 如果删除的不是当前选中的分类，只需要重新加载分类列表
              loadCategories()
            }
          } catch (error) {
            message.error('删除失败')
            console.error('Delete category error:', error)
          }
        }
      })
    }
    
    // 保存分类
    const saveCategory = async () => {
      try {
        await categoryFormRef.value.validate()
        
        const data = {
          name: categoryForm.name,
          description: categoryForm.description
        }
        
        if (editingCategory.value) {
          await api.updateComponentCategory(editingCategory.value.id, data)
          message.success('更新成功')
        } else {
          await api.createComponentCategory(data)
          message.success('创建成功')
        }
        
        cancelCategoryEdit()
        loadCategories()
      } catch (error) {
        if (error.errorFields) return // 表单验证错误
        message.error(editingCategory.value ? '更新失败' : '创建失败')
        console.error('Save category error:', error)
      }
    }
    
    // 取消分类编辑 - 更新重置逻辑
    const cancelCategoryEdit = () => {
      showCategoryModal.value = false
      editingCategory.value = null
      categoryForm.name = ''
      categoryForm.description = ''
      categoryForm.icon = ''
      categoryForm.is_active = true
      categoryForm.sort_order = 1
      categoryFormRef.value?.resetFields()
    }
    
    // 显示新增组件模态框
    const showAddComponentModal = () => {
      // 清空表单
      editingComponent.value = null
      componentForm.name = ''
      componentForm.description = ''
      componentForm.html_template = ''
      componentForm.data_format = ''
      componentForm.tags = []
      componentForm.is_active = true
      componentForm.sort_order = 1
      // 重置表单验证状态
      if (componentFormRef.value) {
        componentFormRef.value.resetFields()
      }
      // 显示模态框
      showComponentModal.value = true
    }
    
    // 编辑组件 - 更新编辑逻辑
    const editComponent = (record) => {
      editingComponent.value = record
      componentForm.name = record.name
      componentForm.description = record.description
      componentForm.html_template = record.html_template || ''  // 移除对旧字段的兼容
      componentForm.data_format = record.data_format || ''
      componentForm.tags = record.tags || []
      componentForm.is_active = record.is_active !== undefined ? record.is_active : true
      componentForm.sort_order = record.sort_order || 1
      showComponentModal.value = true
    }
    
    // 查看组件
    const viewComponent = (record) => {
      viewingComponent.value = record
      showComponentViewModal.value = true
    }

    // 预览组件
    const previewComponent = (record) => {
      previewingComponent.value = record
      previewMode.value = 'desktop' // 默认桌面预览
      generatePreviewUrl(record)
      showComponentPreviewModal.value = true
    }
    
    // 生成预览URL
    const generatePreviewUrl = (component) => {
      const htmlTemplate = component.html_template || ''
      
      // 创建完整的HTML页面结构
      const fullHtml = createPreviewHTML(component.name, htmlTemplate)
      
      // 创建Blob URL
      const blob = new Blob([fullHtml], { type: 'text/html' })
      previewUrl.value = URL.createObjectURL(blob)
    }
    
    // 切换预览模式
    const togglePreviewMode = () => {
      previewMode.value = previewMode.value === 'desktop' ? 'mobile' : 'desktop'
      refreshPreview()
    }
    
    // 刷新预览
    const refreshPreview = () => {
      if (previewingComponent.value) {
        generatePreviewUrl(previewingComponent.value)
      }
    }
    
    // 预览 iframe 加载完成
    const onPreviewLoad = () => {
      // 预览加载完成后，获取 iframe 的 URL
      if (previewIframe.value) {
        previewUrl.value = previewIframe.value.src
      }
    }
    
    // 清理Blob URL
    const cleanupPreviewUrl = () => {
      if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value)
      }
    }
    
    
    // 删除组件
    const deleteComponent = (record) => {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除组件 "${record.name}" 吗？`,
        onOk: async () => {
          try {
            await api.deleteComponent(record.id)
            message.success('删除成功')
            loadComponents(componentPagination.current, componentPagination.pageSize)
          } catch (error) {
            message.error('删除失败')
            console.error('Delete component error:', error)
          }
        }
      })
    }
    
    // 保存组件 - 更新保存逻辑
    const saveComponent = async () => {
      try {
        await componentFormRef.value.validate()
        
        const data = {
          name: componentForm.name,
          description: componentForm.description,
          html_template: componentForm.html_template,
          data_format: componentForm.data_format,
          tags: componentForm.tags,
          is_active: componentForm.is_active,
          sort_order: Number(componentForm.sort_order),
          category_id: activeCategoryId.value  // 使用 category_id
        }
        
        if (editingComponent.value) {
          await api.updateComponent(editingComponent.value.id, data)
          message.success('更新成功')
        } else {
          await api.createComponent(data)
          message.success('创建成功')
        }
        
        cancelComponentEdit()
        loadComponents(componentPagination.current, componentPagination.pageSize)
      } catch (error) {
        if (error.errorFields) return // 表单验证错误
        message.error(editingComponent.value ? '更新失败' : '创建失败')
        console.error('Save component error:', error)
      }
    }
    
    // 取消组件编辑 - 更新重置逻辑
    const cancelComponentEdit = () => {
      showComponentModal.value = false
      editingComponent.value = null
      componentForm.name = ''
      componentForm.description = ''
      componentForm.html_template = ''
      componentForm.data_format = ''
      componentForm.tags = []
      componentForm.is_active = true
      componentForm.sort_order = 1
      componentFormRef.value?.resetFields()
    }
    
    // 处理组件表格变化
    const handleComponentTableChange = (pagination) => {
      loadComponents(pagination.current, pagination.pageSize)
    }
    
    // 监听分类变化，自动加载组件
    watch(activeCategoryId, (newCategoryId) => {
      if (newCategoryId) {
        loadComponents(1, componentPagination.pageSize)
      }
    })
    
    // 监听预览模态框关闭，清理资源
    watch(showComponentPreviewModal, (newVal) => {
      if (!newVal) {
        cleanupPreviewUrl()
      }
    })
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadCategories()
    })

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // 导入组件相关方法
    const openImportModal = () => {
      if (!activeCategoryId.value) {
        message.warning('请先选择一个分类')
        return
      }
      
      importStep.value = 'upload'
      parsedComponents.value = []
      importSuccess.value = false
      importError.value = ''
      showImportModal.value = true
    }
    
    const triggerFileSelect = () => {
      fileInput.value.click()
    }
    
    const handleFileSelected = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const fileContent = e.target.result
          const components = parseComponentsFromHTML(fileContent)
          
          if (components.length === 0) {
            message.error('未找到有效的组件定义')
            return
          }
          
          parsedComponents.value = components
          importStep.value = 'preview'
        } catch (error) {
          message.error('解析文件失败: ' + error.message)
        }
      }
      
      reader.readAsText(file)
    }
    
    const importComponents = async () => {
      if (!activeCategoryId.value) {
        message.error('请先选择一个分类')
        return
      }
      
      importing.value = true
      successCount.value = 0
      
      try {
        // 逐个导入组件
        for (const component of parsedComponents.value) {
          if (!validateComponent(component)) continue
          
          // 添加分类ID
          const componentData = {
            ...component,
            category_id: activeCategoryId.value
          }
          
          // 调用API创建组件
          await api.createComponent(componentData)
          successCount.value++
        }
        
        importSuccess.value = true
        importStep.value = 'result'
        
        // 刷新组件列表
        loadComponents()
      } catch (error) {
        importSuccess.value = false
        importError.value = '导入失败: ' + (error.message || '未知错误')
        importStep.value = 'result'
      } finally {
        importing.value = false
      }
    }
    
    const cancelImport = () => {
      importStep.value = 'upload'
      parsedComponents.value = []
    }
    
    const closeImport = () => {
      showImportModal.value = false
      importStep.value = 'upload'
      parsedComponents.value = []
    }
    
    return {
      // 数据
      categories,
      components,
      categoryLoading,
      componentLoading,
      activeCategoryId,
      
      // 模态框状态
      showCategoryModal,
      showComponentModal,
      showComponentViewModal,
      showComponentPreviewModal,
      showImportModal,
      
      // 编辑状态
      editingCategory,
      editingComponent,
      viewingComponent,
      previewingComponent,
      
      // 预览相关
      previewMode,
      previewUrl,
      previewIframe,
      
      
      // 表单数据
      categoryForm,
      componentForm,
      
      // 分页
      componentPagination,
      
      // 表格列
      componentColumns,
      
      // 表单验证
      categoryRules,
      componentRules,
      
      // 表单引用
      categoryFormRef,
      componentFormRef,
      
      // 方法
      loadCategories,
      loadComponents,
      handleCategoryChange,
      refreshCategories,
      showAddCategoryModal,
      editCategory,
      deleteCategory,
      saveCategory,
      cancelCategoryEdit,
      showAddComponentModal,
      editComponent,
      viewComponent,
      deleteComponent,
      saveComponent,
      cancelComponentEdit,
      handleComponentTableChange,
      formatDate,
      previewComponent,
      togglePreviewMode,
      refreshPreview,
      onPreviewLoad,
      
      // 导入相关
      openImportModal,
      fileInput,
      importStep,
      parsedComponents,
      importing,
      importSuccess,
      successCount,
      importError,
      previewColumns,
      triggerFileSelect,
      handleFileSelected,
      importComponents,
      cancelImport,
      closeImport,
    }
  }
}
</script>

<style scoped>
.component-config-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-tabs-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.component-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.component-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-content span {
  flex: 1;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #fafafa;
  border-radius: 8px;
}

.empty-components {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

/* 组件卡片样式 */
.component-cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.component-card {
  position: relative;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.component-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #1890ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.card-title h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.card-content {
  margin-bottom: 12px;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags-section {
  margin-bottom: 12px;
}

.html-preview {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
}

.preview-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.code-preview {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #333;
  line-height: 1.4;
  word-break: break-all;
}

.card-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.sort-order {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
}

.created-time {
  color: #999;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.component-view {
  padding: 16px 0;
}

.component-view h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.component-view p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.6;
}

.code-view {
  margin-top: 16px;
}

.code-view pre {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0 0 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.code-view code {
  background: none;
  padding: 0;
  color: #333;
}

/* Tab 样式调整 */
:deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab) {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-bottom: none;
}

:deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active) {
  background: #fff;
  border-bottom: 1px solid #fff;
}

:deep(.ant-tabs-card > .ant-tabs-content-holder) {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 16px;
}

/* 组件预览样式 */
.component-preview-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.preview-controls {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-content.mobile-preview {
  max-width: 375px;
  margin: 0 auto;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

/* 导入相关样式 */
.import-container {
  padding: 16px 0;
}

.upload-area {
  margin: 20px 0;
}

.upload-box {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-box:hover {
  border-color: #1890ff;
}

.text-gray {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-container {
  text-align: center;
  padding: 40px 0;
}

.success-icon, .error-icon {
  margin-bottom: 24px;
}

.result-actions {
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-cards-container {
    grid-template-columns: 1fr;
  }
  
  .preview-controls {
    flex-wrap: wrap;
  }
}
</style>
