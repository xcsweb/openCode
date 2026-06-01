# openCode CLI

**智能AI驱动的代码管理和开发自动化工具**

> 现代化的CLI工具，利用LLM进行代码生成、分析和自动化任务，支持多模态、上下文压缩、多专家等先进功能。

---

## 📌 项目概述

openCode是一个AI驱动的CLI工具，旨在提升开发者的编码效率，具备以下核心特性：

- 🤖 **多模型集成** - 支持Groq、OpenRouter、Pollinations等多种免费LLM
- 📁 **多模态支持** - 上传图片、文档、代码文件，支持全面的文件处理
- 🧠 **上下文压缩** - 自动压缩对话历史，减少幻觉，提高响应质量
- 👨‍💼 **多专家系统** - 支持单模型多专家和多模型多专家配置
- 🚀 **智能路由** - 根据任务类型自动选择最优模型和专家
- 🔌 **插件生态** - 可扩展的插件系统，支持热加载/热卸载
- ⏰ **自动化任务** - Cron调度，事件触发任务

---

## 🏗️ 核心架构设计

### 架构概览

openCode采用模块化的分层架构设计，各组件之间职责清晰，易于扩展和维护：

```
┌───────────────────────────────────────────────────────────────────┐
│                      用户交互层 (Presentation Layer)              │
│                    ┌──────────────────────────┐                    │
│                    │  CLI命令处理器 (Commander)│                    │
│                    └──────────────────────────┘                    │
│                    ┌──────────────────────────┐                    │
│                    │  终端交互UI (Ink)       │                    │
│                    └──────────────────────────┘                    │
└───────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────┐
│                      核心调度层 (Core Layer)                        │
│                    ┌──────────────────────────┐                    │
│                    │  核心引擎调度器          │                    │
│                    └──────────────────────────┘                    │
│                    ┌──────────────────────────┐                    │
│                    │  任务管理器 (TaskManager)│                    │
│                    └──────────────────────────┘                    │
└───────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────┐
│                      智能服务层 (Intelligence Layer)                │
│                    ┌──────────────────────────┐                    │
│                    │  AI客户端 (AIClient)     │                    │
│                    └──────────────────────────┘                    │
│                    ┌──────────────────────────┐                    │
│                    │  能力路由引擎 (Router)   │                    │
│                    └──────────────────────────┘                    │
│                    ┌──────────────────────────┐                    │
│                    │  专家系统 (ExpertSystem) │                    │
│                    └──────────────────────────┘                    │
└───────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────┐
│                      工具层 (Utility Layer)                        │
│  ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────┐  │
│  │ 文件处理器       │ │ 上下文压缩工具   │ │ 模型能力检测     │  │
│  └──────────────────┘ └──────────────────┘ └───────────────────┘  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────┐  │
│  │ 图片处理工具     │ │ 配置管理器       │ │ 语法高亮         │  │
│  └──────────────────┘ └──────────────────┘ └───────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────┐
│                      存储层 (Storage Layer)                        │
│                    ┌──────────────────────────┐                    │
│                    │  本地配置存储 (JSON)     │                    │
│                    └──────────────────────────┘                    │
│                    ┌──────────────────────────┐                    │
│                    │  任务状态持久化          │                    │
│                    └──────────────────────────┘                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🧩 核心模块详解

### 1. 核心引擎调度层 ([src/core/](file:///workspace/src/core/))

#### 任务管理器 ([TaskManagerImpl](file:///workspace/src/core/task-manager.ts))
```typescript
export interface TaskManager {
  createTask(name: string, options?: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  listTasks(): Promise<Task[]>;
  switchTask(taskId: string): Promise<Task>;
  pauseTask(taskId: string): Promise<void>;
  resumeTask(taskId: string): Promise<void>;
  saveCheckpoint(taskId: string): Promise<void>;
  restoreCheckpoint(taskId: string): Promise<Task>;
  
  addImage(taskId: string, image: ImageAttachment): Promise<void>;
  addFile(taskId: string, file: FileAttachment): Promise<void>;
  clearImages(taskId: string): Promise<void>;
  clearFiles(taskId: string): Promise<void>;
  getImages(taskId: string): Promise<ImageAttachment[]>;
  getFiles(taskId: string): Promise<FileAttachment[]>;
}
```

**核心功能**:
- 任务会话管理（创建、删除、列表、切换）
- 任务中断与恢复（保存检查点、恢复检查点）
- 任务级图片和文件存储
- 任务状态持久化

---

### 2. 智能服务层 ([src/utils/](file:///workspace/src/utils/))

#### AI客户端 ([AIClient](file:///workspace/src/utils/ai-client.ts))
提供统一的AI模型调用接口，支持多种提供商：

```typescript
export class AIClient {
  constructor(groqApiKey?: string, openRouterApiKey?: string)
  
  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse>
  
  prepareMultimodalMessage(
    text: string,
    images: ImageAttachment[],
    files: FileAttachment[],
    model: string
  ): any[]
  
  // 内部方法
  private async callGroq(...)
  private async callOpenRouter(...)
  private async callPollinations(...)
}
```

**支持的模型**:
- 🚀 **Groq** - 免费API，极快速度（500+ tokens/s）
- 🌐 **OpenRouter** - 100+ 主流模型，支持免费模型
- 🌸 **Pollinations** - 完全免费，无需API Key

---

#### 上下文压缩工具 ([context-compression.ts](file:///workspace/src/utils/context-compression.ts))
```typescript
export function compressContext(
  messages: Message[],
  options?: Partial<CompressionOptions>
): CompressionResult

export function countContextTokens(messages: Message[]): number

export function shouldAutoCompress(
  messages: Message[],
  maxContextTokens: number
): { shouldCompress: boolean; currentTokens: number; percentage: number }

export function formatCompressionReport(result: CompressionResult): string
```

**压缩策略**:
1. 分离系统消息和对话消息
2. 提取关键信息（用户偏好、重要决策、任务上下文）
3. 总结早期对话为紧凑摘要
4. 保留最近对话维持上下文

---

#### 模型能力检测 ([model-capabilities.ts](file:///workspace/src/utils/model-capabilities.ts))
```typescript
export interface ModelCapabilities {
  multimodal: boolean;
  maxTokens: number;
  maxContextLength: number;
  supportsSystemMessage: boolean;
  streaming: boolean;
  codeGeneration: boolean;
  reasoning: boolean;
}

export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  'groq/llama-3.3-70b-versatile': { /* ... */ },
  // 更多模型...
}

export function supportsMultimodal(model: string): boolean
export function isGoodForCode(model: string): boolean
export function canStream(model: string): boolean
```

---

#### 文件处理器 ([file-processor.ts](file:///workspace/src/utils/file-processor.ts))
```typescript
export function loadFile(filePath: string): Promise<LoadFileResult>
export function loadFiles(filePaths: string[]): Promise<LoadFilesResult>
export function isFileTypeSupported(filePath: string): boolean
export function getSupportedExtensions(): string[]
export function formatFileSize(bytes: number): string
export function displayFileInfo(file: FileInfo): string
export function formatFilesList(files: any[]): string
```

**支持的文件类型**:
- 🖼️ **图片**: jpg, jpeg, png, gif, webp, bmp
- 📄 **文档**: pdf, doc, docx, txt, md, csv, json
- 💻 **代码**: js, ts, py, java, cpp, c, go, rs, rb, php

---

#### 图片处理器 ([image-processor.ts](file:///workspace/src/utils/image-processor.ts))
```typescript
export async function loadImage(filePath: string): Promise<ImageAttachment>
export async function loadImages(filePaths: string[]): Promise<ImageAttachment[]>
export async function imageToBase64(filePath: string): Promise<string>
export function displayImageInfo(image: ImageAttachment): string
export function formatImagesList(images: any[]): string
export function createOpenAIVisionContent(...)
export function createClaudeVisionContent(...)
export function createGeminiVisionContent(...)
```

---

### 3. 配置管理层 ([src/config/](file:///workspace/src/config/))

#### 配置管理器 ([manager.ts](file:///workspace/src/config/manager.ts))
```typescript
export interface OpenCodeConfig {
  models: ModelConfig[];
  experts: ExpertConfig[];
  plugins: PluginConfig;
  ui: UIConfig;
  performance: PerformanceConfig;
  compression?: CompressionConfig;
  apiKeys?: {
    groq?: string;
    openrouter?: string;
    openai?: string;
    anthropic?: string;
  };
}

export interface CompressionConfig {
  enabled: boolean;
  autoCompress: boolean;
  maxMessages: number;
  maxContextTokens: number;
  preserveSystem: boolean;
  preserveRecent: number;
  warningThreshold: number;
}

export async function loadConfig(configPath?: string): Promise<OpenCodeConfig>
export async function saveConfig(config: OpenCodeConfig, configPath?: string): Promise<void>
export function getConfig(): OpenCodeConfig
export async function updateConfig(updates: Partial<OpenCodeConfig>): Promise<OpenCodeConfig>
```

**配置文件位置**: `~/.opencode/config.json`

---

### 4. 命令层 ([src/commands/](file:///workspace/src/commands/))

#### 聊天命令 ([chat.ts](file:///workspace/src/commands/chat.ts))
主要的交互式聊天界面，支持：
- 自然语言对话
- 图片和文件上传
- 上下文管理（压缩、统计、历史）
- 模型切换
- 多模态支持

**聊天命令**:
```
/help          - 显示帮助
/upload <path> - 上传文件或图片
/files         - 查看已上传文件
/images        - 查看已上传图片
/clear-files   - 清空所有文件
/stats         - 查看上下文统计
/compress      - 手动压缩对话
/history       - 查看对话历史
/models        - 查看可用模型
/new           - 开始新对话
/exit          - 退出
```

---

### 5. 类型定义层 ([src/types/](file:///workspace/src/types/))

#### 核心类型 ([task.ts](file:///workspace/src/types/task.ts))
```typescript
export interface Task {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  context: TaskContext;
  createdAt: number;
  updatedAt: number;
  checkpoints?: Checkpoint[];
}

export interface TaskContext {
  messages: Message[];
  images: ImageAttachment[];
  files: FileAttachment[];
  variables: Record<string, any>;
  checkpoint?: Checkpoint;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentPart[];
  timestamp: number;
}

export interface ImageAttachment {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  base64Data?: string;
  mimeType: string;
  dimensions?: { width: number; height: number };
}

export interface FileAttachment {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  base64Data?: string;
  textContent?: string;
  dimensions?: { width: number; height: number };
}
```

---

## 🎯 关键设计决策

### 1. 多模态支持设计

**设计原则**:
- 统一的内容结构，支持文本和多模态
- 自动降级策略（多模态→文本）
- 多种模型格式转换（OpenAI、Claude、Gemini）

**实现**:
```typescript
export type ContentPart = TextContent | ImageContent | FileContent;

// 内部自动检测模型能力
const content = aiClient.prepareMultimodalMessage(
  text,
  images,
  files,
  currentModel // 自动适配模型格式
);
```

### 2. 上下文压缩策略

**核心思想**:
- 保留系统提示（专家配置）
- 保留最近对话（维持上下文）
- 压缩早期对话为摘要
- 提取关键信息（偏好、决策）

**压缩示例**:
```typescript
// 原始30条消息
// 压缩后 → 5条消息
// 1. 系统摘要
// 2-5. 最近4条消息
```

### 3. 专家系统架构

**支持模式**:
1. **单模型多专家** - 同一模型，不同系统提示
2. **多模型多专家** - 不同模型，每个专家使用最优模型

**路由策略**:
- 自动匹配任务类型
- 模型能力检测
- 用户选择优先

### 4. 插件生态设计

**三层架构**:
1. **官方插件** - 核心功能
2. **私有插件** - 个人定制
3. **社区插件** - 共享贡献

**生命周期钩子**:
- `init()` - 初始化
- `execute()` - 执行
- `destroy()` - 清理

### 5. 错误处理与降级

**层级降级**:
```
┌───────────────────────────────────────────────────┐
│ 1. Groq API (最快)                              │
│    ↓ (失败)                                       │
│ 2. OpenRouter API (丰富的模型)                 │
│    ↓ (失败)                                       │
│ 3. Pollinations API (免费，无需Key)            │
│    ↓ (失败)                                       │
│ 4. 模拟响应 (Demo Mode)                       │
└───────────────────────────────────────────────────┘
```

---

## 📁 项目结构

```
openCode/
├── bin/
│   └── opencode                 # CLI入口点
├── src/
│   ├── commands/
│   │   └── chat.ts             # 聊天命令
│   ├── config/
│   │   └── manager.ts          # 配置管理
│   ├── core/
│   │   └── task-manager.ts     # 任务管理
│   ├── types/
│   │   └── task.ts             # 类型定义
│   └── utils/
│       ├── ai-client.ts        # AI客户端
│       ├── context-compression.ts # 上下文压缩
│       ├── file-processor.ts     # 文件处理
│       ├── image-processor.ts    # 图片处理
│       ├── model-capabilities.ts # 模型能力
│       ├── text-stream.ts        # 文本流
│       └── syntax-highlight.ts  # 语法高亮
├── tests/
│   ├── run-all.js              # 综合测试
│   ├── test-cli.js             # CLI测试
│   ├── test-compression.js     # 压缩测试
│   └── test-pollinations.js    # Pollinations测试
├── dist/                       # 编译输出
├── package.json
├── tsconfig.json
└── 文档...
```

---

## 🚀 快速开始

### 安装

```bash
git clone <repo>
cd openCode
npm install
npm run build
npm link
```

### 配置

**最简单的方式：使用交互式设置向导**

```bash
opencode settings setup
```

向导会引导你选择 AI 提供商并配置 API Key。

---

**手动配置：**

1. 获取免费 API Key：
   - **Groq（推荐）**: https://console.groq.com/keys
   - **OpenRouter**: https://openrouter.ai/keys

2. 配置 API Key：
```bash
opencode settings api-key groq your-groq-api-key-here
```

或者直接编辑配置文件 `~/.opencode/config.json`：
```json
{
  "apiKeys": {
    "groq": "your-groq-api-key-here"
  }
}
```

### 查看配置

```bash
opencode settings show
```

### 使用

```bash
opencode chat
```

---

## 📚 完整文档

- [README.md](file:///workspace/README.md) - 项目总览
- [QUICKSTART.md](file:///workspace/QUICKSTART.md) - 快速入门
- [CONTEXT_COMPRESSION.md](file:///workspace/CONTEXT_COMPRESSION.md) - 上下文压缩说明
- [COMPATIBILITY.md](file:///workspace/COMPATIBILITY.md) - 模型兼容性说明
- [TEST_REPORT.md](file:///workspace/TEST_REPORT.md) - 测试报告

---

## 🛠️ 开发

### 构建

```bash
npm run build
```

### 测试

```bash
# 运行综合测试
npm run test:integration

# 运行特定测试
node tests/test-compression.js
node tests/test-cli.js
```

### 开发模式

```bash
npm run dev        # 监听文件变化
npm run lint       # 代码检查
npm run format     # 代码格式化
```

---

## 🎓 核心概念

### 专家 (Expert)

预配置的角色，包含特定的系统提示和任务类型：

```typescript
export interface ExpertConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  modelId: string;
  specialties: string[];
  capabilities?: string[];
  createdAt?: number;
  updatedAt?: number;
}
```

### 任务 (Task)

工作会话，包含消息历史、附件、变量等：

```typescript
export interface Task {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  context: TaskContext;
  createdAt: number;
  updatedAt: number;
}
```

---

## 📊 技术栈

- **语言**: TypeScript
- **CLI框架**: Commander.js
- **终端UI**: Ink (React for Terminal)
- **工具**:
  - 图片处理: Sharp
  - 终端加载: Ora
  - 格式化: Prettier
  - 代码检查: ESLint

---

## 🌟 特性对比

| 特性 | openCode | 其他工具 |
|------|-----------|---------|
| 多模型支持 | ✅ 3+提供商 | ❌ 单一或有限 |
| 多模态 | ✅ 图片+文件 | ❌ 仅文本或有限 |
| 上下文压缩 | ✅ 智能压缩 | ❌ 无或简单 |
| 专家系统 | ✅ 多专家+路由 | ❌ 单一或无 |
| 自动化任务 | ✅ Cron+事件 | ❌ 无或有限 |
| 插件生态 | ✅ 可扩展 | ❌ 无或有限 |
| 免费API | ✅ 完整支持 | ❌ 需付费 |

---

## 📝 License

MIT © openCode Contributors

---

## 🔗 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 一些功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启Pull Request

---

## 💡 致谢

感谢所有开源项目的灵感和资源！
