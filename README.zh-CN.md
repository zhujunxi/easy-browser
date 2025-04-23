<h1 align="center">Easy-Browser</h1>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://github.com/zhujunxi/easy-browser">
    <img src="https://img.shields.io/badge/version-0.1.1-blue.svg" alt="Version" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-Apache%202.0-green.svg" alt="License" />
  </a>
</p>

<h2 align="center">基于大语言模型的网页自动化助手浏览器插件</h2>

## 📖 简介

Easy-Browser 是一个基于大型语言模型（LLMs）的 Chrome 浏览器扩展，旨在简化网页自动化操作。通过自然语言交互，用户可以轻松完成网页浏览、信息提取和自动化任务，无需编写复杂的脚本或使用传统的自动化工具。

## ✨ 功能特点

- **自然语言交互**：通过简单的自然语言指令控制浏览器行为
- **智能网页分析**：自动识别和提取网页中的关键元素和信息
- **自动化操作**：支持点击、填写表单、滚动等常见浏览器操作
- **上下文感知**：理解当前网页内容和状态，提供相关的操作建议
- **跨网站支持**：适用于各类网站，无需针对特定网站进行配置


## 🔧 使用说明

1. 安装扩展后，点击工具栏中的 Easy-Browser 图标打开扩展面板
2. 配置大模型 API 密钥
3. 输入自然语言指令，例如：
   - "今天股市的行情怎么样？"
   - "播放B站红警蓝天的最新视频，并点赞"
   - "明天北京飞上海的航班，白天抵达而且价格最低的是哪一班？"
4. Easy-Browser会解构任务并把浏览器作为它的工具来完成任务

## 🚀 安装方法

### 从 Chrome Web Store 安装
[📦 Easy-Browser](https://chromewebstore.google.com/detail/easy-browser/lbegjmdppmjkfenknnokmoflmaldheok)

### 从源码构建

1. 克隆仓库
   ```bash
   git clone https://github.com/zhujunxi/easy-browser.git
   cd easy-browser
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 构建扩展
   ```bash
   npm run build
   ```

4. 在 Chrome 中加载扩展
   - 打开 Chrome 浏览器，进入 `chrome://extensions/`
   - 开启「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择项目的 `dist` 目录

## 🛠️ 开发指南

### 项目结构

```
src/
├── background/     # 浏览器扩展的后台脚本
├── content/        # 注入到网页中的内容脚本
├── popup/          # 扩展弹出窗口界面
├── sidepanel/      # 侧边栏面板
├── options/        # 扩展选项页面
├── components/     # 共享 React 组件
├── services/       # 服务层，包括 LLM 和浏览器 API
├── utils/          # 工具函数
└── assets/         # 静态资源
```

### 开发命令

- `npm run dev` - 启动开发服务器，支持热重载
- `npm run build` - 构建生产版本，并生成扩展zip包
- `npm run lint` - 运行 ESLint 检查代码
- `npm run format` - 运行 Prettier 格式化代码

## 🔌 技术栈

- **前端框架**: React 19
- **构建工具**: Vite 6
- **样式**: SASS
- **语言模型集成**: 支持多种 LLM 服务（openai/qwen/deepseek）
- **浏览器扩展框架**: Chrome Extensions Manifest V3

## 🤝 贡献指南

我们欢迎各种形式的贡献，包括但不限于：

- 报告 Bug
- 提交功能请求
- 提交代码改进
- 改进文档

## 📜 许可证

本项目采用 Apache License 2.0 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

---

<p align="center">Made with ❤️ for a better browsing experience</p>
