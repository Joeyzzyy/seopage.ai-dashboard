<template>
  <div class="graph-root">
    <h2>{{ graph.root }}</h2>
    <div class="branches-row">
      <div v-for="(branch, bIdx) in groupedBranches" :key="branch.name" class="branch-vertical glass-card">
        <div class="branch-title">{{ branch.name }}</div>
        <div class="branch-title-zh">{{ branch.nameZh }}</div>
        <div class="vertical-flow">
          <div
            v-for="(rowModels, rowIdx) in branch.groupedModels"
            :key="rowIdx"
            class="row-group"
          >
            <div class="row-title">
              <span class="row-title-en">{{ branch.rowTitles[rowIdx] }}</span>
              <span class="row-title-zh">{{ branch.rowTitlesZh[rowIdx] }}</span>
            </div>
            <div class="altpage-row">
              <div
                v-for="model in rowModels"
                :key="model.label"
                class="v-step"
                
              >
                <div class="step-content">
                  <span class="step-text">
                    {{ getBusinessName(model) }}
                  </span>
                  <span class="step-text-zh">
                    {{ getBusinessNameZh(model) }}
                  </span>
                  <div class="step-ai-info-inside">
                    <img :src="model.logo" alt="AI" class="ai-logo" />
                    <span class="ai-label">
                      Using: {{ model.modelName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const graph = reactive({
  branches: [
    {
      name: 'Write Blog',
      nameZh: '写博客',
      rowTitles: ['Topic Selection', 'Outline & Content', 'Slug Generation'],
      rowTitlesZh: ['主题选择', '大纲与内容', '短链生成'],
      models: [
        {
          label: '1. Keyword Selection',
          labelZh: '1. 关键词选择',
          logo: '/gemini.png',
          modelName: 'Gemini Flash 2.0',
          rowNum: 1
        },
        {
          label: '2. Write Outline',
          labelZh: '2. 撰写大纲',
          logo: '/gemini.png',
          modelName: 'Gemini Flash 2.0',
          rowNum: 2
        },
        {
          label: '3. Write Blog Content',
          labelZh: '3. 撰写博客内容',
          logo: '/gemini.png',
          modelName: 'Gemini Flash 2.0',
          rowNum: 2
        },
        {
          label: '4. Generate Slug',
          labelZh: '4. 生成页面唯一标识',
          logo: '/gemini.png',
          modelName: 'Gemini Flash 2.0',
          rowNum: 3
        }
      ]
    },
    {
      name: 'Write Alternative Page',
      nameZh: '写替代页面',
      rowTitles: ['Dialog Control', 'Competitor Discovery', 'Content Generation', 'Content Deployment'],
      rowTitlesZh: ['对话控制', '竞品查找', '内容生成', '内容部署'],
      models: [
        {
          label: '1. Copilot for Flow Control',
          labelZh: '1. 流程控制助手',
          logo: '/openai.png',
          modelName: 'GPT4o',
          rowNum: 1
        },
        {
          label: '2. Agent for Competitor Discovery',
          labelZh: '2. 竞争对手发现代理',
          logo: '/deepseek.png',
          modelName: 'DeepSeek R1',
          rowNum: 2
        },
        {
          label: '3. Agent for Color Scheme Analysis',
          labelZh: '3. 色彩方案分析代理',
          logo: '/gemini.png',
          modelName: 'Gemini 2.5 Pro',
          rowNum: 3
        },
        {
          label: '4. Workflow for Altpage Content Generation',
          labelZh: '4. Alt页内容生成工作流',
          logo: '/gemini.png',
          modelName: 'Gemini 2.0 Flash',
          rowNum: 3
        },
        {
          label: '5. Direct Call for HTML Code Generation',
          labelZh: '5. 直接调用生成HTML代码',
          logo: '/claude.png',
          modelName: 'Claude 3.7 Sonnet',
          rowNum: 3
        },
        {
          label: '6. Generate Slug',
          labelZh: '6. 生成页面唯一标识',
          logo: '/gemini.png',
          modelName: '2.0 Flash',
          rowNum: 4
        }
      ]
    }
  ]
})

// 按 rowNum 分组
function groupByRowNum(models) {
  const groups = {}
  models.forEach(model => {
    if (!groups[model.rowNum]) groups[model.rowNum] = []
    groups[model.rowNum].push(model)
  })
  // 返回按 rowNum 升序排列的二维数组
  return Object.keys(groups)
    .sort((a, b) => a - b)
    .map(rowNum => groups[rowNum])
}

const groupedBranches = computed(() => {
  return graph.branches.map(branch => ({
    ...branch,
    groupedModels: groupByRowNum(branch.models)
  }))
})

function getBusinessName(model) {
  if (typeof model === 'string') {
    const parts = model.split('. ')
    return parts.length > 1 ? parts[1] : model
  } else if (typeof model === 'object' && model.label) {
    const parts = model.label.split('. ')
    return parts.length > 1 ? parts[1] : model.label
  }
  return ''
}

function getBusinessNameZh(model) {
  if (typeof model === 'object' && model.labelZh) {
    const parts = model.labelZh.split('. ')
    return parts.length > 1 ? parts[1] : model.labelZh
  }
  return ''
}
</script>

<style scoped>
.graph-root {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  margin: 32px;
  min-height: 100vh;
  padding-bottom: 48px;
}
h2 {
  text-align: center;
  font-size: 2.2em;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #232946;
  margin-bottom: 40px;
}
.branches-row {
  display: flex;
  flex-direction: row;
  gap: 72px;
  justify-content: center;
  align-items: flex-start;
  max-width: 1800px;
  margin: 0 auto;
}
.glass-card {
  background: rgba(245, 247, 250, 0.85);
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 rgba(79, 140, 255, 0.08), 0 1.5px 8px #6ee7b722 inset;
  backdrop-filter: blur(6px) saturate(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.1);
  border: 1.5px solid #e0e7ef;
  min-width: 420px;
  padding: 32px 28px 28px 28px;
  transition: box-shadow 0.2s, border-color 0.2s;
  position: relative;
  overflow: hidden;
}
.glass-card:hover {
  box-shadow: 0 8px 32px 0 #4f8cff22, 0 2px 8px #6ee7b733 inset;
  border-color: #4f8cff;
}
.branch-title {
  font-size: 1.5em;
  font-weight: 900;
  margin-bottom: 8px;
  color: #1a237e;
  text-align: center;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #4f8cff22;
}
.branch-title-zh {
  font-size: 1.15em;
  font-weight: 700;
  color: #232946;
  text-align: center;
  margin-bottom: 18px;
  letter-spacing: 0.2px;
}
.vertical-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}
.row-group {
  width: 100%;
  max-width: 900px;
  min-height: 220px;
  background: linear-gradient(90deg, #e0e7ef 0%, #f5f7fa 100%);
  border-radius: 28px;
  box-shadow: 0 4px 24px 0 rgba(79, 140, 255, 0.08), 0 1.5px 8px #6ee7b722 inset;
  padding: 64px 24px 32px 24px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s, border-color 0.2s;
  position: relative;
}
.altpage-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 16px;
  width: 100%;
}
.v-step {
  flex: 1 1 0;
  min-width: 0;
  max-width: 400px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #fff;
  border: 1.5px solid #e0e7ef;
  border-radius: 16px;
  padding: 28px 40px;
  font-size: 1.08em;
  color: #232946;
  box-shadow: 0 2px 8px #4f8cff11;
  text-align: center;
  font-weight: 500;
  position: relative;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  z-index: 1;
  flex-direction: row;
}
.v-step:hover {
  box-shadow: 0 4px 16px #4f8cff22, 0 1px 4px #6ee7b722 inset;
  border-color: #4f8cff;
  transform: translateY(-2px) scale(1.02);
}
.row-num {
  font-size: 1em;
  font-weight: 700;
  color: #4f8cff;
  margin-right: 16px;
  min-width: 48px;
  text-align: right;
}
.circle-num {
  display: none;
}
.step-text {
  flex: 1;
  word-break: break-word;
  letter-spacing: 0.1px;
  font-size: 1em;
}
.step-text-zh {
  flex: 1;
  word-break: break-word;
  letter-spacing: 0.1px;
  font-size: 0.98em;
  color: #232946cc;
  margin-top: 2px;
  margin-bottom: 2px;
}
.v-arrow, .h-arrow {
  display: none !important;
}
.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.step-ai-info-inside {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  gap: 12px;
}
.ai-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  opacity: 0.92;
}
.ai-label {
  font-size: 0.98em;
  color: #4f8cff;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.row-title {
  position: absolute;
  top: 18px;
  left: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 2;
}
.row-title-en {
  font-size: 1.08em;
  font-weight: 700;
  color: #4f8cff;
  letter-spacing: 0.2px;
}
.row-title-zh {
  font-size: 1em;
  font-weight: 500;
  color: #232946cc;
  margin-top: 2px;
  letter-spacing: 0.1px;
}
@media (max-width: 900px) {
  .branches-row {
    flex-direction: column;
    gap: 32px;
    align-items: center;
    max-width: 100%;
  }
  .glass-card {
    min-width: 0;
    width: 100%;
    max-width: 440px;
  }
}
</style>
