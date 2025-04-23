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

<h2 align="center">Web automation assistant extension based on LLMs.</h2>

## 📖 Introduction

Easy-Browser is a Chrome browser extension based on Large Language Models (LLMs), designed to simplify web automation. Through natural language interaction, users can easily complete web browsing, information extraction, and automation tasks without writing complex scripts or using traditional automation tools.

## ✨ Features

- **Natural Language Interaction**: Control browser behavior through simple natural language instructions
- **Intelligent Web Analysis**: Automatically identify and extract key elements and information from web pages
- **Automated Operations**: Support for clicking, form filling, scrolling, and other common browser operations
- **Context Awareness**: Understand current web page content and status to provide relevant operation suggestions
- **Cross-site Support**: Applicable to various websites without requiring site-specific configuration


## 🔧 Usage Guide

1. After installing the extension, click the Easy-Browser icon in the toolbar to open the extension panel
2. Configure your LLM API key
3. Enter natural language instructions, such as:
   - "What is the latest stock price of Alphabet?"
   - "Play MrBeast's latest videos on YouTube"
   - "Which flight from London to Paris will arrive during the day tomorrow and have the lowest price?"
3. Easy-Browser will analyze the current web page and perform the corresponding operations or provide operation suggestions

## 🚀 Installation

### Install from the Chrome Web Store
 [📦 Easy-Browser](https://chromewebstore.google.com/detail/easy-browser/lbegjmdppmjkfenknnokmoflmaldheok)

### Build from Source

1. Clone the repository
   ```bash
   git clone https://github.com/zhujunxi/easy-browser.git
   cd easy-browser
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build the extension
   ```bash
   npm run build
   ```

4. Load the extension in Chrome
   - Open Chrome browser and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked extension"
   - Select the `dist` directory of the project

## 🛠️ Development Guide

### Project Structure

```
src/
├── background/     # Browser extension background scripts
├── content/        # Content scripts injected into web pages
├── popup/          # Extension popup interface
├── sidepanel/      # Side panel
├── options/        # Extension options page
├── components/     # Shared React components
├── services/       # Service layer, including LLM and browser APIs
├── utils/          # Utility functions
└── assets/         # Static resources
```

### Development Commands

- `npm run dev` - Start the development server with hot reload support
- `npm run build` - Build the production version
- `npm run lint` - Run ESLint to check code
- `npm run format` - Run Prettier to format code

## 🔌 Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: SASS
- **Language Model Integration**: Support for various LLM services
- **Browser extension framework**: Chrome Extensions Manifest V3

## 🤝 Contribution Guidelines

We welcome various forms of contributions, including but not limited to:

- Bug reports
- Feature requests
- Code improvements
- Documentation improvements

## 📜 License

This project is licensed under the Apache License 2.0 License - see the [LICENSE](LICENSE) file for details

---

<p align="center">Made with ❤️ for a better browsing experience</p>
