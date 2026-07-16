# 🦜 Little Parrot English (小鹦鹉英语)

一个面向儿童的 AI 英语学习应用，通过互动角色和游戏化教学让英语学习变得有趣。

## 功能特色

- 🎭 **AI 小鹦鹉老师** - 智能英语教学伙伴
- 🃏 **卡片激活系统** - 实体卡片与数字内容互动
- 🗺️ **世界探索** - 沉浸式英语学习场景
- 🎨 **绘画功能** - 创意表达与词汇学习
- 📚 **课程系统** - 系统化的英语学习路径
- 🏪 **商店** - 解锁更多学习内容

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI 组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS
- **状态管理**: React Query + Context
- **动画**: Motion (Framer Motion)
- **路由**: React Router v6
- **PWA**: Vite Plugin PWA

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 bun

### 安装

```bash
# 克隆仓库
git clone https://github.com/cornpiess/little-parrot-english-2026.git
cd little-parrot-english-2026

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 可用脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run build:dev    # 构建开发版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
npm run test         # 运行测试
npm run test:watch   # 监听模式测试
```

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── AITeacherMode/   # AI 教学模式
│   ├── HomePageV3/      # 主页（当前版本）
│   ├── onboarding/      # 引导流程组件
│   └── ui/              # shadcn/ui 组件
├── contexts/            # React Context
├── hooks/               # 自定义 Hooks
├── lib/                 # 工具函数
├── pages/               # 页面组件
│   ├── lessons/         # 课程页面
│   └── ...
└── assets/              # 静态资源
```

## 部署

本项目支持 PWA 部署。构建后可直接部署到任何静态托管服务。

```bash
npm run build
# 将 dist 目录部署到你的服务器
```

## 许可证

MIT License
