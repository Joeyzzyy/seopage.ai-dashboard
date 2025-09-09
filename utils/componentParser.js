/**
 * 组件解析器 - 从HTML文件中提取组件信息
 */

/**
 * 解析HTML文件中的组件
 * @param {string} fileContent - HTML文件内容
 * @returns {Array} - 解析出的组件数组
 */
export const parseComponentsFromHTML = (fileContent) => {
  const components = []
  
  // 使用正则表达式匹配组件注释和HTML内容
  const componentRegex = /<!--\s*ID:\s*([A-Z_]+)\s*Description:\s*([^]*?)\s*Data:\s*([^]*?)\s*-->\s*([^]*?)(?=<!--|\s*$)/g
  
  let match
  while ((match = componentRegex.exec(fileContent)) !== null) {
    const id = match[1].trim()
    const description = match[2].trim()
    const dataStructure = match[3].trim()
    const htmlTemplate = match[4].trim()
    
    // 提取数据格式
    let dataFormat = ''
    try {
      // 从 Data: { ... } 中提取JSON结构
      const dataMatch = dataStructure.match(/\{([^]*)\}/)
      if (dataMatch && dataMatch[0]) {
        // 格式化JSON结构
        dataFormat = dataMatch[0]
      }
    } catch (error) {
      console.error('解析数据格式失败:', error)
    }
    
    // 提取标签
    const tags = []
    // 从ID中提取可能的标签
    const idParts = id.split('_')
    if (idParts.length > 1) {
      idParts.slice(1).forEach(part => {
        tags.push(part.toLowerCase())
      })
    }
    
    components.push({
      name: id,
      description,
      html_template: htmlTemplate,
      data_format: dataFormat,
      tags,
      is_active: true,
      sort_order: components.length + 1
    })
  }
  
  return components
}

/**
 * 验证组件数据是否有效
 * @param {Object} component - 组件数据
 * @returns {boolean} - 是否有效
 */
export const validateComponent = (component) => {
  return (
    component.name && 
    component.html_template && 
    component.html_template.length > 0
  )
}
