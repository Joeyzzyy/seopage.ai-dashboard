// 创建预览HTML的工具函数
export const createPreviewHTML = (componentName, htmlTemplate) => {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName} - 悬浮预览</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            "50":"#fdf4ff",
                            "100":"#fae8ff",
                            "200":"#f5d0fe",
                            "300":"#f0abfc",
                            "400":"#e879f9",
                            "500":"#d946ef",
                            "600":"#c026d3",
                            "700":"#a21caf",
                            "800":"#86198f",
                            "900":"#701a75",
                            "950":"#4a044e"
                        }
                    }
                },
                fontFamily: {
                    'body': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
                    'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif']
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; padding: 16px; font-family: 'Inter', sans-serif; background: #f9fafb; }
        .preview-container { max-width: 100%; }
    </style>
</head>
<body class="font-sans">
    <div class="preview-container">
        ${htmlTemplate}
    </div>
</body>
</html>`
}
