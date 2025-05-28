<template>
  <div class="edm-container">
    <!-- Mobile Block Modal - 改为非阻塞式 -->
    <a-modal
      v-model:visible="showMobileBlock"
      title="建议使用PC端访问"
      :closable="true"
      :maskClosable="true"
      centered
      width="400px"
    >
      <template #footer>
        <a-button @click="showMobileBlock = false">我知道了</a-button>
        <a-button type="primary" @click="continueMobile">继续使用</a-button>
      </template>
      <div class="mobile-block-content">
        <div class="mobile-icon">
          📱 ➡️ 💻
        </div>
        <p>EDM邮件管理功能在PC端使用体验更佳。</p>
        <div class="mobile-tips">
          <p><strong>PC端优势：</strong></p>
          <ul>
            <li>更大的编辑区域</li>
            <li>更好的预览效果</li>
            <li>完整的功能支持</li>
          </ul>
        </div>
        <p class="mobile-note">您也可以继续在移动端使用基础功能。</p>
      </div>
    </a-modal>

    <!-- Mobile Warning Banner -->
    <div v-if="isMobile && !showMobileBlock && !hideMobileWarning" class="mobile-warning-banner">
      <div class="warning-content">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">当前为移动端，建议使用PC端获得更佳体验</span>
        <a-button size="small" type="text" @click="hideMobileWarning = true" class="close-warning">
          ✕
        </a-button>
      </div>
    </div>

    <!-- Original content - 移动端也显示，但添加提示 -->
    <div>
      <a-row :gutter="isMobile ? [16, 16] : 24" class="mb-24">
        <!-- Left Form Section -->
        <a-col :span="isMobile ? 24 : 8">
          <a-card title="Email Template Configuration">
            <a-form
              :model="formState"
              layout="vertical"
            >
              <a-form-item label="Subject">
                <a-input v-model:value="formState.subject" />
              </a-form-item>
              
              <a-form-item label="Email Title">
                <a-input v-model:value="formState.emailTitle" />
              </a-form-item>
              
              <a-form-item label="Email Content">
                <a-textarea
                  v-model:value="formState.emailContent"
                  :rows="4"
                />
              </a-form-item>
              
              <a-form-item label="HTML Content">
                <a-textarea
                  v-model:value="formState.htmlContent"
                  :rows="8"
                  :placeholder="'Paste your HTML code here or write custom HTML content\nExample:\n<div style=\'color: blue;\'>\n  <h1>Hello</h1>\n  <img src=\'https://example.com/image.jpg\' />\n</div>'"
                />
              </a-form-item>
              
              <a-form-item label="Sender Name">
                <a-input v-model:value="formState.senderName" />
              </a-form-item>
              
              <a-form-item label="Sender Email">
                <a-input v-model:value="formState.senderEmail" />
              </a-form-item>

              <a-form-item label="Recipients (One email per line)">
                <a-textarea
                  v-model:value="formState.recipients"
                  :rows="4"
                  placeholder="Enter email addresses, one per line"
                />
              </a-form-item>

              <a-form-item>
                <div class="button-group">
                  <a-button 
                    class="action-button"
                    @click="handlePreview"
                  >
                    Preview
                  </a-button>
                  <a-button 
                    class="action-button"
                    @click="handleSave"
                  >
                    Save
                  </a-button>
                  <a-button 
                    type="primary" 
                    class="action-button"
                    @click="handleSend"
                    :loading="sending"
                  >
                    Send
                  </a-button>
                </div>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>

        <!-- Right Preview Section -->
        <a-col :span="isMobile ? 24 : 16">
          <a-card title="Email Preview">
            <div class="preview-container">
              <iframe
                :srcdoc="previewHtml"
                frameborder="0"
                :style="isMobile ? 'width: 100%; height: 400px;' : 'width: 100%; height: 800px;'"
              ></iframe>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Email Records Table -->
      <a-card title="Email Records" class="mt-24">
        <a-table
          :columns="columns"
          :data-source="emailList"
          :loading="tableLoading"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'sendStatus'">
              <a-tag :color="record.sendStatus === 'sent' ? 'success' : 'error'">
                {{ record.sendStatus }}
              </a-tag>
            </template>
            <template v-if="column.key === 'delivered_status'">
              <a-tag :color="record.delivered_status === 'delivered' ? 'success' : 'warning'">
                {{ record.delivered_status }}
              </a-tag>
            </template>
            <template v-if="column.key === 'open_status'">
              <a-tag :color="record.open_status === 'opened' ? 'success' : 'default'">
                {{ record.open_status || 'unopened' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'content'">
              <a-button type="link" @click="showContent(record)">
                View Content
              </a-button>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- Content Modal -->
      <a-modal
        v-model:visible="contentModalVisible"
        title="Email Content"
        width="800px"
        :footer="null"
      >
        <div class="email-content-preview">
          <iframe
            :srcdoc="selectedContent"
            frameborder="0"
            style="width: 100%; height: 600px;"
          ></iframe>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { api } from '../api/api'

// Form state
const formState = reactive({
  subject: '',
  emailTitle: 'Welcome to WebsiteLM',
  emailContent: 'Thank you for registering with WebsiteLM. Please use the verification code below to complete your registration. If you didn\'t request this, please ignore this email.',
  htmlContent: '',
  senderName: 'WebsiteLM',
  senderEmail: 'noreply@websitelm.com',
  replyToEmail: 'joey@techacc.com',
  recipients: ''
})

const sending = ref(false)

// Base HTML template
const baseHtml = ref(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link
      rel="preload"
      as="image"
      href="https://strapi.sheet2email.com/media/6768df5eb828c9bcfbec07af/20250208-171307.png"
    />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--$-->
  </head>
  <div
    style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
  >
    WebsiteLM Email Verification
    <div>
       ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿
    </div>
  </div>
  <body style="background-color:#fff;color:#212121">
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width:37.5em;padding:20px;margin:0 auto;background-color:#f0f8ff"
    >
      <tbody>
        <tr style="width:100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color:#fff"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      style="background-color:#e6f3ff;display:flex;padding:20px 0;align-items:center;justify-content:center"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <img
                              alt="WebsiteLM's Logo"
                              height="80"
                              src="https://websitelm-us-east-2.s3.us-west-2.amazonaws.com/20250208-171307.png"
                              style="display:block;outline:none;border:none;text-decoration:none;object-fit:contain"
                              width="160"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="padding:25px 35px"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <h1
                              style="color:#333;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:20px;font-weight:bold;margin-bottom:15px"
                            >
                              Welcome to WebsiteLM
                            </h1>
                            <p
                              style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin-bottom:14px"
                            >
                              Thank you for registering with WebsiteLM. Please use the verification code below to complete your registration. If you didn't request this, please ignore this email.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <hr
                      style="width:100%;border:none;border-top:1px solid #eaeaea"
                    />
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="padding:25px 35px"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style="font-size:14px;line-height:24px;margin:0px;color:#333;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif"
                            >
                              WebsiteLM will never email you and ask
                              you to disclose or verify your password, credit
                              card, or banking account number.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              style="font-size:12px;line-height:24px;margin:24px 0;color:#666;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;padding:0 20px"
            >
              This is an automated message from WebsiteLM Inc. Please do not reply directly to this email. © 2024 WebsiteLM Inc. All rights reserved.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>
`)

// Preview HTML
const previewHtml = ref(baseHtml.value)

// Handle preview button click
const handlePreview = () => {
  let updatedHtml = baseHtml.value
  updatedHtml = updatedHtml.replace(
    'Welcome to WebsiteLM',
    formState.emailTitle
  )
  
  // If HTML content is provided, use it; otherwise use plain text content
  const contentToUse = formState.htmlContent || formState.emailContent
  updatedHtml = updatedHtml.replace(
    'Thank you for registering with WebsiteLM. Please use the verification code below to complete your registration. If you didn\'t request this, please ignore this email.',
    contentToUse
  )
  
  previewHtml.value = updatedHtml
  message.success('Preview updated')
}

// Handle save button click
const handleSave = () => {
  try {
    // Here you would typically save the template to the backend
    message.success('Template saved successfully')
  } catch (error) {
    message.error('Failed to save template')
  }
}

// Handle send button click
const handleSend = async () => {
  if (!formState.recipients.trim()) {
    message.error('Please enter at least one recipient email address')
    return
  }

  const emails = formState.recipients
    .split('\n')
    .map(email => email.trim())
    .filter(email => email)

  if (emails.length === 0) {
    message.error('Please enter valid email addresses')
    return
  }

  sending.value = true
  try {
    await api.batchSendEmail({
      emails: emails,
      html: previewHtml.value,
      subject: formState.subject,
      sendEmail: formState.senderEmail,
      sendName: formState.senderName,
      replyTo: formState.replyToEmail
    })
    message.success('Emails sent successfully')
  } catch (error) {
    message.error('Failed to send emails: ' + (error.message || 'Unknown error'))
  } finally {
    sending.value = false
  }
}

// Table columns configuration
const columns = [
  {
    title: 'Batch ID',
    dataIndex: 'batch_id',
    key: 'batch_id',
    width: 220,
  },
  {
    title: 'Recipient',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: 'Subject',
    dataIndex: 'subject',
    key: 'subject',
    width: 200,
  },
  {
    title: 'Send Status',
    dataIndex: 'sendStatus',
    key: 'sendStatus',
    width: 120,
  },
  {
    title: 'Delivery Status',
    dataIndex: 'delivered_status',
    key: 'delivered_status',
    width: 120,
  },
  {
    title: 'Open Status',
    dataIndex: 'open_status',
    key: 'open_status',
    width: 120,
  },
  {
    title: 'Send Time',
    dataIndex: 'send_time',
    key: 'send_time',
    width: 180,
    render: (text) => new Date(text).toLocaleString(),
  },
  {
    title: 'Content',
    key: 'content',
    width: 100,
  }
]

const emailList = ref([])
const tableLoading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
})

// Fetch email records
const getEmailList = async () => {
  tableLoading.value = true
  try {
    const endTime = new Date()
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - 7)
    
    const response = await api.getBatchEmailList({
      page: pagination.current,
      limit: pagination.pageSize,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })
    
    emailList.value = response.data
    pagination.total = response.TotalCount
  } catch (error) {
    message.error('Failed to fetch email records')
  } finally {
    tableLoading.value = false
  }
}

// Handle table pagination change
const handleTableChange = (pag) => {
  pagination.current = pag.current
  getEmailList()
}

// Mobile detection
const isMobile = ref(false)
const showMobileBlock = ref(false)
const hideMobileWarning = ref(false)

// Check if device is mobile
const checkMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
  const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))
  const isSmallScreen = window.innerWidth < 1024
  
  const wasMobile = isMobile.value
  isMobile.value = isMobileDevice || isSmallScreen
  
  // 只在首次检测到移动端时显示提示
  if (isMobile.value && !wasMobile && !localStorage.getItem('edmMobileWarningShown')) {
    showMobileBlock.value = true
  }
}

// Continue using mobile
const continueMobile = () => {
  showMobileBlock.value = false
  localStorage.setItem('edmMobileWarningShown', 'true')
}

// Handle window resize
const handleResize = () => {
  checkMobile()
}

// Fetch data on component mount
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  getEmailList() // 移动端也加载数据
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Add these new refs
const contentModalVisible = ref(false)
const selectedContent = ref('')

// Add show content function
const showContent = (record) => {
  selectedContent.value = record.content
  contentModalVisible.value = true
}
</script>

<style scoped>
.edm-container {
  padding: 24px;
}

.preview-container {
  background: #fff;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.action-button {
  min-width: 80px;
}

.mb-24 {
  margin-bottom: 24px;
}

.mt-24 {
  margin-top: 24px;
}

.email-content-preview {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

/* Add some styles for the HTML content textarea */
:deep(.ant-input) {
  font-family: 'Courier New', Courier, monospace;
}

.mobile-block-content {
  text-align: center;
  padding: 20px 0;
}

.mobile-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.mobile-block-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.mobile-tips {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0;
  text-align: left;
}

.mobile-tips p {
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
}

.mobile-tips ul {
  margin: 0;
  padding-left: 16px;
}

.mobile-tips li {
  color: #666;
  margin-bottom: 2px;
  font-size: 12px;
}

.mobile-note {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.mobile-warning-banner {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
  position: relative;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  font-size: 16px;
}

.warning-text {
  flex: 1;
  font-size: 13px;
  color: #d46b08;
}

.close-warning {
  padding: 0;
  height: auto;
  line-height: 1;
  color: #d46b08;
}

/* 移动端适配 */
@media (max-width: 1023px) {
  .edm-container {
    padding: 16px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-button {
    width: 100%;
  }
}
</style> 