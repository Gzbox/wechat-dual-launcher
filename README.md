# WeChat Dual Launcher (微信双开助手)

[English](#english) | [简体中文](#简体中文)

---

## English

A modern, fast, and secure macOS desktop application that allows you to run two instances of WeChat simultaneously. Built with Electron, React, TypeScript, and Tailwind CSS.

### Features ✨

- **Dual Instance Launching**: Run a secondary instance of WeChat easily with a click.
- **Mac-Native UI**: Beautiful interface that feels right at home on macOS.
- **Internationalization (i18n)**: Full support for both English and Simplified Chinese.
- **Automation**: Automatic detection of your local WeChat installation path.
- **Safe & Clean**: Safely manages the WeChat copy without modifying your primary application files. Includes a tool to cleanly remove the cloned application when not needed.
- **Updates**: Simple process to refresh your cloned instance when WeChat releases an update.

### Requirements 💻

- **OS**: macOS 10.15 or later
- **WeChat**: The official WeChat application installed in your `/Applications` directory (`/Applications/WeChat.app`)

### Tech Stack 🛠️

- **Framework**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Electron Vite](https://electron-vite.org/)

### Development Setup 🚀

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd wechat-dual-launcher
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Development Server
```bash
npm run dev
```

#### 4. Build the Apple Silicon / Intel Mac App (DMG)
```bash
npm run build:mac
```
The compiled macOS app (`.dmg` and `.app` formats) will be generated in the `dist` or `release` directory.

### License 📄

MIT License. See `LICENSE` for more information.

---

## 简体中文

一款现代、快速且安全的 macOS 桌面应用程序，让您可以同时运行两个微信实例。基于 Electron、React、TypeScript 和 Tailwind CSS 构建。

### 功能特点 ✨

- **双开运行**：一键轻松运行第二个微信实例。
- **原生应用体验**：美观的界面设计，完美融入 macOS 系统风格。
- **国际化 (i18n)**：全面提供英文与简体中文支持。
- **自动化**：自动检测您本地的微信安装路径。
- **安全与纯净**：安全管理微信副本，不修改您的主应用程序文件。内置清理工具，在不需要时可彻底移除克隆的应用。
- **便捷更新**：当微信发布更新时，提供简单的操作流程来刷新您的克隆实例。

### 运行环境 💻

- **系统**：macOS 10.15 或更高版本
- **微信**：在 `/Applications` 目录下安装了官方微信应用 (`/Applications/WeChat.app`)

### 技术栈 🛠️

- **框架**：[Electron](https://www.electronjs.org/)
- **前端页面**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **样式**：[Tailwind CSS v4](https://tailwindcss.com/)
- **构建工具**：[Electron Vite](https://electron-vite.org/)

### 开发指南 🚀

#### 1. 克隆仓库
```bash
git clone <您仓库的-url>
cd wechat-dual-launcher
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 启动开发服务器
```bash
npm run dev
```

#### 4. 构建 macOS 应用 (DMG)
```bash
npm run build:mac
```
编译完成的 macOS 应用（`.dmg` 和 `.app` 格式）将生成在 `dist` 或 `release` 目录中。

### 开源协议 📄

使用 MIT 协议。查看 `LICENSE` 了解更多信息。
