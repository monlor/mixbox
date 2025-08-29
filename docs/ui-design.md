# MixBox 用户端 UI 设计规范文档

## 1. 设计理念

### 1.1 核心设计原则

#### 简洁至上 (Simplicity First)
- **极简交互**: 复杂功能简化为直观的操作流程
- **信息层次**: 清晰的视觉层次，突出重要信息
- **减少认知负担**: 避免用户思考，提供直觉式体验

#### 现代美学 (Modern Aesthetics)
- **现代设计语言**: 采用当前流行的设计趋势
- **视觉一致性**: 整个应用保持统一的设计风格
- **精致细节**: 关注每个交互细节的视觉体验

#### 用户友好 (User-Friendly)
- **零学习成本**: 新用户无需学习即可上手
- **容错性设计**: 用户操作错误能够轻松恢复
- **反馈及时**: 每个操作都有清晰的视觉反馈

#### 响应式优先 (Responsive-First)
- **移动优先**: 先设计移动端体验，再适配桌面
- **跨设备一致**: 不同设备上保持一致的用户体验
- **流畅适配**: 平滑的尺寸变化和布局调整

### 1.2 目标用户体验
- **10秒内理解**: 用户能在10秒内理解主要功能
- **3步完成任务**: 核心任务在3步内完成
- **零技术门槛**: 技术小白也能轻松使用
- **愉悦的使用过程**: 操作过程令人愉快

## 2. 视觉设计规范

### 2.1 色彩系统 (Color System)

#### 主色调 (Primary Colors)
```css
/* 主品牌色 - 蓝紫渐变 */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* 主色 */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
--primary-950: #172554;

/* 主渐变色 */
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
--gradient-primary-hover: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
```

#### 辅助色彩 (Secondary Colors)
```css
/* 成功色 - 绿色系 */
--success-50: #ecfdf5;
--success-500: #10b981;
--success-600: #059669;
--gradient-success: linear-gradient(135deg, #10b981 0%, #34d399 100%);

/* 警告色 - 橙色系 */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);

/* 错误色 - 红色系 */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;
--gradient-error: linear-gradient(135deg, #ef4444 0%, #f87171 100%);

/* 信息色 - 青色系 */
--info-50: #ecfeff;
--info-500: #06b6d4;
--info-600: #0891b2;
--gradient-info: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
```

#### 中性色彩 (Neutral Colors)
```css
/* 浅色主题 */
--gray-50: #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-400: #94a3b8;
--gray-500: #64748b;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
--gray-900: #0f172a;

/* 深色主题 */
--dark-50: #1e293b;
--dark-100: #334155;
--dark-200: #475569;
--dark-300: #64748b;
--dark-400: #94a3b8;
--dark-500: #cbd5e1;
--dark-600: #e2e8f0;
--dark-700: #f1f5f9;
--dark-800: #f8fafc;
--dark-900: #ffffff;
```

#### 背景色彩 (Background Colors)
```css
/* 浅色主题背景 */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
--bg-glass: rgba(255, 255, 255, 0.7);

/* 深色主题背景 */
--bg-dark-primary: #0f172a;
--bg-dark-secondary: #1e293b;
--bg-dark-tertiary: #334155;
--bg-dark-glass: rgba(15, 23, 42, 0.8);
```

### 2.2 字体系统 (Typography)

#### 字体族 (Font Family)
```css
/* 主要字体 - 系统字体栈 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
             'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 代码字体 */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 
             'Cascadia Code', 'Roboto Mono', Consolas, monospace;

/* 数字字体 */
--font-numeric: 'Inter', tabular-nums, sans-serif;
```

#### 字体大小 (Font Sizes)
```css
--text-xs: 0.75rem;    /* 12px - 辅助文本 */
--text-sm: 0.875rem;   /* 14px - 次要文本 */
--text-base: 1rem;     /* 16px - 正文 */
--text-lg: 1.125rem;   /* 18px - 重要文本 */
--text-xl: 1.25rem;    /* 20px - 小标题 */
--text-2xl: 1.5rem;    /* 24px - 中标题 */
--text-3xl: 1.875rem;  /* 30px - 大标题 */
--text-4xl: 2.25rem;   /* 36px - 超大标题 */
```

#### 字重 (Font Weights)
```css
--font-light: 300;     /* 细体 */
--font-normal: 400;    /* 常规 */
--font-medium: 500;    /* 中等 */
--font-semibold: 600;  /* 半粗 */
--font-bold: 700;      /* 粗体 */
```

#### 行高 (Line Heights)
```css
--leading-tight: 1.25;    /* 紧凑行高 */
--leading-normal: 1.5;    /* 正常行高 */
--leading-relaxed: 1.625; /* 宽松行高 */
```

### 2.3 间距系统 (Spacing System)

#### 基础间距 (Base Spacing)
```css
/* 4px 为基础单位的间距系统 */
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

#### 语义化间距 (Semantic Spacing)
```css
/* 组件内间距 */
--spacing-component-xs: var(--space-2);   /* 8px */
--spacing-component-sm: var(--space-3);   /* 12px */
--spacing-component-md: var(--space-4);   /* 16px */
--spacing-component-lg: var(--space-6);   /* 24px */
--spacing-component-xl: var(--space-8);   /* 32px */

/* 布局间距 */
--spacing-layout-xs: var(--space-4);      /* 16px */
--spacing-layout-sm: var(--space-6);      /* 24px */
--spacing-layout-md: var(--space-8);      /* 32px */
--spacing-layout-lg: var(--space-12);     /* 48px */
--spacing-layout-xl: var(--space-16);     /* 64px */

/* 页面间距 */
--spacing-page-x: var(--space-6);         /* 24px */
--spacing-page-y: var(--space-8);         /* 32px */
```

### 2.4 圆角系统 (Border Radius)

```css
--radius-none: 0;
--radius-sm: 0.25rem;      /* 4px - 小圆角 */
--radius-base: 0.5rem;     /* 8px - 基础圆角 */
--radius-md: 0.75rem;      /* 12px - 中等圆角 */
--radius-lg: 1rem;         /* 16px - 大圆角 */
--radius-xl: 1.5rem;       /* 24px - 超大圆角 */
--radius-full: 9999px;     /* 完全圆形 */

/* 语义化圆角 */
--radius-button: var(--radius-base);     /* 按钮圆角 */
--radius-card: var(--radius-lg);         /* 卡片圆角 */
--radius-modal: var(--radius-xl);        /* 模态框圆角 */
--radius-input: var(--radius-sm);        /* 输入框圆角 */
```

### 2.5 阴影系统 (Shadow System)

```css
/* 基础阴影 */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* 彩色阴影 */
--shadow-primary: 0 10px 20px -5px rgba(59, 130, 246, 0.3);
--shadow-success: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
--shadow-warning: 0 10px 20px -5px rgba(245, 158, 11, 0.3);
--shadow-error: 0 10px 20px -5px rgba(239, 68, 68, 0.3);

/* 语义化阴影 */
--shadow-card: var(--shadow-sm);
--shadow-card-hover: var(--shadow-md);
--shadow-modal: var(--shadow-xl);
--shadow-dropdown: var(--shadow-lg);
--shadow-button: var(--shadow-xs);
--shadow-button-hover: var(--shadow-sm);
```

### 2.6 玻璃拟态效果 (Glass Morphism)

```css
/* 玻璃效果基础样式 */
.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
}

/* 深色主题玻璃效果 */
.dark .glass-effect {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 不同透明度的玻璃效果 */
.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.glass-medium {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
}

.glass-heavy {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(30px);
}
```

## 3. 组件设计规范

### 3.1 按钮组件 (Button)

#### 按钮变体 (Button Variants)
```tsx
// 主要按钮 - 用于最重要的操作
<Button variant="primary" size="md">
  安装应用
</Button>

// 次要按钮 - 用于辅助操作
<Button variant="secondary" size="md">
  取消
</Button>

// 轮廓按钮 - 用于不突出的操作
<Button variant="outline" size="md">
  查看详情
</Button>

// 幽灵按钮 - 用于最次要的操作
<Button variant="ghost" size="md">
  编辑
</Button>

// 渐变按钮 - 用于特殊强调
<Button variant="gradient" size="md">
  立即体验
</Button>
```

#### 按钮样式规范
```css
/* 基础按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: var(--font-medium);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  outline: none;
  user-select: none;
}

/* 按钮尺寸 */
.btn-xs { padding: var(--space-1) var(--space-2); font-size: var(--text-xs); }
.btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--text-sm); }
.btn-md { padding: var(--space-3) var(--space-4); font-size: var(--text-base); }
.btn-lg { padding: var(--space-4) var(--space-6); font-size: var(--text-lg); }
.btn-xl { padding: var(--space-5) var(--space-8); font-size: var(--text-xl); }

/* 主要按钮 */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-button);
  border-radius: var(--radius-button);
}

.btn-primary:hover {
  background: var(--gradient-primary-hover);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

/* 次要按钮 */
.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-button);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

/* 轮廓按钮 */
.btn-outline {
  background: transparent;
  color: var(--primary-600);
  border: 2px solid var(--primary-200);
  border-radius: var(--radius-button);
}

.btn-outline:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
}

/* 渐变按钮 */
.btn-gradient {
  background: var(--gradient-primary);
  color: white;
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-primary);
  position: relative;
  overflow: hidden;
}

.btn-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-gradient:hover::before {
  opacity: 1;
}
```

### 3.2 卡片组件 (Card)

#### 卡片变体
```tsx
// 基础卡片
<Card variant="default">
  <CardContent>卡片内容</CardContent>
</Card>

// 玻璃效果卡片
<Card variant="glass">
  <CardContent>玻璃效果卡片</CardContent>
</Card>

// 悬浮卡片
<Card variant="elevated">
  <CardContent>悬浮卡片</CardContent>
</Card>

// 交互卡片
<Card variant="interactive">
  <CardContent>可点击卡片</CardContent>
</Card>
```

#### 卡片样式规范
```css
/* 基础卡片 */
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 玻璃效果卡片 */
.card-glass {
  @extend .glass-effect;
  border-radius: var(--radius-card);
}

/* 悬浮卡片 */
.card-elevated {
  background: var(--bg-primary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
}

/* 交互卡片 */
.card-interactive {
  background: var(--bg-primary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  cursor: pointer;
}

.card-interactive:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-4px);
}

/* 卡片内容区域 */
.card-content {
  padding: var(--spacing-component-lg);
}

.card-header {
  padding: var(--spacing-component-lg);
  border-bottom: 1px solid var(--gray-200);
}

.card-footer {
  padding: var(--spacing-component-lg);
  border-top: 1px solid var(--gray-200);
}
```

### 3.3 输入组件 (Input)

#### 输入框样式
```css
/* 基础输入框 */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--gray-700);
  background: var(--bg-primary);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-input);
  transition: all 0.2s ease;
  outline: none;
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:hover {
  border-color: var(--gray-300);
}

.input::placeholder {
  color: var(--gray-400);
}

/* 错误状态 */
.input-error {
  border-color: var(--error-500);
}

.input-error:focus {
  border-color: var(--error-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* 成功状态 */
.input-success {
  border-color: var(--success-500);
}

/* 禁用状态 */
.input:disabled {
  background: var(--gray-50);
  color: var(--gray-400);
  cursor: not-allowed;
}
```

### 3.4 徽章组件 (Badge)

```css
/* 基础徽章 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* 徽章变体 */
.badge-default {
  background: var(--gray-100);
  color: var(--gray-700);
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge-success {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-warning {
  background: var(--warning-100);
  color: var(--warning-700);
}

.badge-error {
  background: var(--error-100);
  color: var(--error-700);
}

/* 带点徽章 */
.badge-dot {
  position: relative;
  padding-left: var(--space-4);
}

.badge-dot::before {
  content: '';
  position: absolute;
  left: var(--space-2);
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: translateY(-50%);
}

.badge-success.badge-dot::before {
  background: var(--success-500);
}
```

## 4. 布局系统

### 4.1 网格系统 (Grid System)

```css
/* 基础网格容器 */
.grid {
  display: grid;
  gap: var(--spacing-layout-sm);
}

/* 响应式网格 */
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }

/* 响应式断点 */
@media (min-width: 640px) {
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .sm\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
}
```

### 4.2 容器系统 (Container System)

```css
/* 基础容器 */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-page-x);
  padding-right: var(--spacing-page-x);
}

/* 响应式容器 */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

### 4.3 Flexbox 工具类

```css
/* Flex 容器 */
.flex { display: flex; }
.inline-flex { display: inline-flex; }

/* Flex 方向 */
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-row-reverse { flex-direction: row-reverse; }
.flex-col-reverse { flex-direction: column-reverse; }

/* Flex 对齐 */
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

/* Flex 增长和收缩 */
.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-none { flex: none; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-grow { flex-grow: 1; }
```

## 5. 动画与过渡

### 5.1 过渡系统 (Transition System)

```css
/* 基础过渡 */
.transition {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-fast {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-slow {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 特定属性过渡 */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-opacity {
  transition: opacity 0.2s ease;
}

/* 缓动函数 */
.ease-linear { transition-timing-function: linear; }
.ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
```

### 5.2 变换效果 (Transform Effects)

```css
/* 悬浮效果 */
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* 缩放效果 */
.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* 旋转效果 */
.hover-rotate {
  transition: transform 0.3s ease;
}

.hover-rotate:hover {
  transform: rotate(5deg);
}

/* 组合效果 */
.hover-float {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-float:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-lg);
}
```

### 5.3 加载动画 (Loading Animations)

```css
/* 旋转加载 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* 渐入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* 滑入动画 */
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-100%); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}
```

## 6. 响应式设计

### 6.1 断点系统 (Breakpoint System)

```css
/* 断点定义 */
:root {
  --breakpoint-xs: 0;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* 媒体查询 mixin */
@custom-media --xs (min-width: 0);
@custom-media --sm (min-width: 640px);
@custom-media --md (min-width: 768px);
@custom-media --lg (min-width: 1024px);
@custom-media --xl (min-width: 1280px);
@custom-media --2xl (min-width: 1536px);
```

### 6.2 响应式工具类

```css
/* 显示/隐藏 */
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }

@media (min-width: 640px) {
  .sm\:hidden { display: none; }
  .sm\:block { display: block; }
  .sm\:flex { display: flex; }
}

@media (min-width: 768px) {
  .md\:hidden { display: none; }
  .md\:block { display: block; }
  .md\:flex { display: flex; }
}

/* 响应式间距 */
@media (min-width: 640px) {
  .sm\:p-8 { padding: var(--space-8); }
  .sm\:m-8 { margin: var(--space-8); }
}

@media (min-width: 768px) {
  .md\:p-12 { padding: var(--space-12); }
  .md\:m-12 { margin: var(--space-12); }
}
```

### 6.3 移动端优化

```css
/* 触摸优化 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* 移动端按钮 */
@media (max-width: 767px) {
  .btn-mobile {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-lg);
    min-height: 44px;
  }
}

/* 移动端输入框 */
@media (max-width: 767px) {
  .input-mobile {
    padding: var(--space-4);
    font-size: 16px; /* 防止 iOS 缩放 */
    min-height: 44px;
  }
}
```

## 7. 主题系统

### 7.1 深色主题

```css
/* 深色主题变量 */
[data-theme="dark"] {
  --bg-primary: var(--dark-50);
  --bg-secondary: var(--dark-100);
  --bg-tertiary: var(--dark-200);
  --bg-glass: rgba(30, 41, 59, 0.7);
  
  --text-primary: var(--dark-900);
  --text-secondary: var(--dark-700);
  --text-tertiary: var(--dark-500);
  
  --border-primary: var(--dark-200);
  --border-secondary: var(--dark-300);
  
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

/* 主题切换动画 */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### 7.2 主题切换组件

```tsx
const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  return (
    <div className="theme-toggle">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleTheme()}
        className="theme-toggle-btn"
      >
        {theme === 'light' ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
};
```

## 8. 图标系统

### 8.1 图标规范

```css
/* 图标基础样式 */
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  stroke: currentColor;
  vertical-align: middle;
}

/* 图标尺寸 */
.icon-xs { width: 12px; height: 12px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }

/* 图标变体 */
.icon-outline {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.icon-solid {
  fill: currentColor;
  stroke: none;
}
```

### 8.2 常用图标集

```typescript
// 系统图标
export const SystemIcons = {
  // 导航
  Home,
  Settings,
  User,
  Search,
  Menu,
  
  // 操作
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  
  // 状态
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader,
  
  // 箭头
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
};

// 应用图标
export const AppIcons = {
  // 服务状态
  Play,
  Pause,
  Stop,
  Refresh,
  
  // 网络
  Globe,
  Wifi,
  Server,
  Database,
  
  // 工具
  Terminal,
  Code,
  Package,
  Shield
};
```

## 9. 状态设计

### 9.1 加载状态

```css
/* 骨架屏 */
.skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-text {
  @extend .skeleton;
  height: 1em;
  border-radius: var(--radius-sm);
}

.skeleton-avatar {
  @extend .skeleton;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-card {
  @extend .skeleton;
  height: 200px;
  border-radius: var(--radius-card);
}
```

### 9.2 空状态

```css
/* 空状态容器 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-layout-xl);
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-component-lg);
  color: var(--gray-400);
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  margin-bottom: var(--spacing-component-sm);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--gray-500);
  margin-bottom: var(--spacing-component-lg);
  max-width: 400px;
}
```

### 9.3 错误状态

```css
/* 错误状态 */
.error-state {
  @extend .empty-state;
}

.error-state-icon {
  @extend .empty-state-icon;
  color: var(--error-500);
}

.error-state-title {
  @extend .empty-state-title;
  color: var(--error-700);
}

.error-state-description {
  @extend .empty-state-description;
  color: var(--error-600);
}

.error-state-actions {
  display: flex;
  gap: var(--spacing-component-md);
  flex-wrap: wrap;
  justify-content: center;
}
```

## 10. 无障碍设计

### 10.1 无障碍访问规范

```css
/* 焦点指示器 */
.focus-visible:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-600);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: var(--radius-sm);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* 屏幕阅读器专用内容 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 10.2 ARIA 标签使用

```typescript
// 常用 ARIA 属性
interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'role'?: string;
}
```

## 11. 性能优化

### 11.1 CSS 性能优化

```css
/* 使用 transform 和 opacity 进行动画 */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* 开启硬件加速 */
}

/* 避免重排和重绘 */
.performance-friendly {
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 使用 CSS containment */
.contained {
  contain: layout style paint;
}
```

### 11.2 关键 CSS

```css
/* 关键路径 CSS - 内联到 HTML */
.critical-css {
  /* 首屏必需的样式 */
  body { margin: 0; font-family: var(--font-sans); }
  .container { max-width: 1280px; margin: 0 auto; }
  .btn-primary { background: var(--gradient-primary); color: white; }
}
```

---

本 UI 设计规范文档定义了 MixBox 用户端的完整视觉和交互设计标准，确保整个应用具有一致的用户体验和现代化的视觉效果。