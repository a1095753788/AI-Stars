# AI多模态聊天应用

[![React Native](https://img.shields.io/badge/React%20Native-0.73.1-61dafb)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

这是一个基于React Native开发的多模态AI聊天应用，支持文本、图片和文件交互，并提供语音朗读功能。

## 📱 功能特点

### AI聊天功能
- **多模型支持**：连接多种AI模型（如GPT、Claude、Gemini、deepseek、Qwen）。
- **自定义API配置**：用户可添加、删除和切换API密钥及端点。
- **聊天记录管理**：保存和加载聊天历史。
- **默认界面**：打开应用显示设置和主页，点击聊天框进入新聊天界面。
- **单对话限制**：同一对话内只允许发送一张图片或文件，用户可点击"新对话"开启新会话绕过限制。
- **多文件解锁**：设置中可启用"多文件多图片"功能，解除限制。

### 多媒体支持
- **图片上传**：从图库或相机选择图片，默认单对话限一张。
- **文件上传**：支持文件发送，默认单对话限一个。
- **图片压缩**：自动压缩至5MB以内。
- **图片消息**：在聊天中显示图片，点击查看大图。

### 用户体验
- **主题切换**：支持深色和浅色主题。
- **语言设置**：界面语言随系统设置。
- **语音朗读**：朗读AI回复文本，支持播放/停止。
- **配置管理**：用户可随时添加/删除API配置和提示词映射。

## 🎨 用户界面

### 主要屏幕
1. **默认界面**：包含设置页面和主页（聊天框预览）。
2. **聊天界面**：点击聊天框后进入，与AI对话的主界面，含"新对话"按钮。
3. **设置界面**：配置API、提示词及多文件选项。

### UI组件
- **消息气泡**：区分用户和AI消息。
- **图片消息**：显示图片，点击查看大图。
- **设置列表**：统一风格的配置项，支持添加/删除。
- **下拉列表**：选择API模型。
- **新对话按钮**：重置对话，允许新文件上传。
- **加载指示器**：操作进行时显示状态。

## 🔧 技术栈

### 核心技术
- **React Native 0.73.1**：跨平台开发框架。
- **TypeScript 5.0.4**：静态类型检查。
- **React Navigation 6.x**：应用导航。
- **Redux/Redux Toolkit**：状态管理。
- **MMKV & AsyncStorage**：数据持久化。

### UI和动画
- **React Native Paper 5.12.x**：Material Design组件。
- **React Native Reanimated 3.6.x**：高性能动画。
- **React Native Gesture Handler**：手势处理。

### 图片和文件处理
- **react-native-image-picker**：访问相机和图库。
- **react-native-image-resizer**：图片压缩。
- **react-native-fast-image**：高效图片加载。
- **react-native-document-picker**：文件选择。

### 网络和API
- **Axios**：HTTP客户端。
- **react-native-config**：环境变量管理。

### 语音功能
- **react-native-tts**：文本转语音支持。

## 📂 项目结构

```
react-native-chat-app/
├── android/                    # Android原生代码
├── ios/                        # iOS原生代码
├── src/                        # 应用源代码
│   ├── assets/                 # 静态资源（图像、字体等）
│   ├── presentation/           # UI组件和屏幕
│   │   ├── components/         # 可复用组件
│   │   │   ├── chat/           # 聊天相关组件
│   │   │   ├── common/         # 通用组件
│   │   │   └── settings/       # 设置界面组件
│   │   ├── screens/            # 应用屏幕
│   │   │   ├── DefaultScreen.tsx # 默认界面（设置+主页）
│   │   │   ├── ChatScreen.tsx  # 聊天界面
│   │   │   └── SettingsScreen.tsx # 设置界面
│   │   └── theme/              # 主题相关文件
│   ├── services/               # 服务层
│   │   ├── apiService.ts       # API服务接口
│   │   └── navigationService.ts # 导航服务
│   ├── types/                  # TypeScript类型定义
│   │   ├── api.ts              # API相关类型
│   │   ├── message.ts          # 消息相关类型
│   │   └── theme.ts            # 主题相关类型
│   └── utils/                  # 工具函数
│       ├── aiService.ts        # AI服务工具
│       ├── imageService.ts     # 图片处理服务
│       ├── fileService.ts      # 文件处理服务
│       ├── messageService.ts   # 消息管理服务
│       ├── promptService.ts    # 提示词管理服务
│       └── voiceService.ts     # 语音服务
├── __tests__/                  # 测试文件
├── __mocks__/                  # 测试模拟
├── App.tsx                     # 应用入口组件
├── babel.config.js             # Babel配置
├── index.js                    # 应用注册入口
├── metro.config.js             # Metro打包配置
├── package.json                # 项目依赖和脚本
├── tsconfig.json               # TypeScript配置
└── jest.config.js              # Jest测试配置
```

## 🔍 核心文件功能说明

### 应用入口
- **index.js**：注册应用入口。
- **App.tsx**：根组件，包含导航和主题管理。

### 聊天功能
- **src/presentation/screens/DefaultScreen.tsx**：默认界面，显示设置和主页，点击聊天框跳转。
- **src/presentation/screens/ChatScreen.tsx**：聊天界面，含"新对话"按钮，限制单文件上传。
- **src/utils/messageService.ts**：管理聊天历史，跟踪对话内文件数量。
- **src/utils/aiService.ts**：处理AI模型交互。

### 设置功能
- **src/presentation/screens/SettingsScreen.tsx**：设置主界面。
- **src/presentation/components/settings/**：
  - **ApiSettingsSection.tsx**：API配置，支持添加/删除。
  - **PromptSettingsSection.tsx**：提示词管理，支持添加/删除。
  - **MultiFileSection.tsx**：多文件多图片开关。
  - **ThemeSettingsSection.tsx**：主题切换。
  - **VoiceSettingsSection.tsx**：语音设置。

### 图片和文件处理
- **src/utils/imageService.ts**：处理图片选择和压缩。
- **src/utils/fileService.ts**：处理文件选择。
- **src/presentation/components/chat/ImageMessageBubble.tsx**：图片消息显示。

### 提示词管理
- **src/utils/promptService.ts**：管理关键词-提示词映射。
- **src/presentation/components/chat/PromptButton.tsx**：聊天界面提示词按钮。

### 语音功能
- **src/utils/voiceService.ts**：处理文本朗读。
- **src/presentation/components/chat/VoiceButton.tsx**：播放/停止按钮。

### 主题
- **src/presentation/theme/ThemeContext.tsx**：主题管理。
- **src/presentation/theme/theme.ts**：主题样式定义。

## 🚀 安装和运行

### 前提条件
- Node.js (>= 16.x)
- npm 或 yarn
- Android Studio（Android开发）
- Xcode（iOS开发，macOS）

### 安装步骤
1. 克隆仓库并进入目录：
   ```bash
   git clone <仓库URL>
   cd react-native-chat-app
   ```
2. 安装依赖：
   ```bash
   npm install
   # 或
   yarn install
   ```
3. 安装iOS依赖（仅macOS）：
   ```bash
   cd ios && pod install && cd ..
   ```
4. 启动应用：
   ```bash
   # Android
   npm run android
   # 或
   npx react-native run-android

   # iOS
   npm run ios
   # 或
   npx react-native run-ios
   ```

## 📦 依赖库清单

### 核心依赖
- react: "18.2.0"
- react-native: "0.73.1"
- typescript: "5.0.4"

### 导航
- @react-navigation/native: "^6.1.9"
- @react-navigation/native-stack: "^6.9.17"
- react-native-screens: "^3.29.0"
- react-native-safe-area-context: "^4.8.2"
- react-native-gesture-handler: "^2.14.0"

### UI和动画
- react-native-paper: "^5.12.3"
- react-native-reanimated: "^3.6.3"
- react-native-modal: "^13.0.1"

### 图片和文件处理
- react-native-image-picker: "^7.1.0"
- react-native-image-resizer: "^1.4.5"
- react-native-fast-image: "^8.6.3"
- react-native-document-picker: "^9.1.1"

### 存储和数据管理
- @react-native-async-storage/async-storage: "^1.21.0"
- react-native-mmkv: "^2.12.2"
- redux: "^5.0.1"
- react-redux: "^9.1.0"
- @reduxjs/toolkit: "^2.2.1"

### 语音支持
- react-native-tts: "^4.1.0"

### 网络和API
- axios: "^1.6.8"
- react-native-config: "^1.5.1"

### 其他工具
- lodash: "^4.17.21"
- uuid: "^9.0.1"
- react-native-permissions: "^4.1.5"

## 📝 注意事项

1. **API密钥**：使用前需在设置中配置AI服务的API密钥。
2. **权限**：需要相机和存储权限支持图片/文件功能。
3. **单文件限制**：默认单对话限一张图片或文件，可在设置中解锁多文件支持。
4. **兼容性**：优化支持iOS 13+和Android 6.0+。
5. **语言**：界面语言随系统设置。

## 🤝 贡献指南

欢迎提交代码、报告问题或建议改进。请查看[CONTRIBUTING.md](CONTRIBUTING.md)了解详情。

## 📄 许可证

本项目采用MIT许可证 - 详情见[LICENSE](LICENSE)文件。

---

### 调整说明
1. **单对话限制**：
   - 在`ChatScreen.tsx`和`messageService.ts`中添加逻辑，跟踪当前对话的文件计数，默认限制为1。
   - 新增“新对话”按钮，重置计数并开启新会话。
2. **多文件解锁**：
   - 在`SettingsScreen.tsx`添加`MultiFileSection.tsx`，包含开关控件。
   - 使用Redux存储开关状态，控制`messageService.ts`中的限制逻辑。
3. **依赖调整**：
   - 添加`react-native-document-picker`支持文件上传。
4. **逻辑清晰**：
   - 文件限制和解锁功能明确写入“功能特点”和“注意事项”，用户可轻松理解。

此文档已根据您的要求调整，确保功能模块化、配置管理友好。如需进一步细化，请告诉我！