# OpenAI 兼容 MCP 客户端

🌐 **语言**: [English](README.md) | [繁體中文](README_zh-TW.md) | [简体中文](README_zh-CN.md)

一个用于连接 OpenAI 兼容 LLM 来源的 MCP (Model Context Protocol) 客户端，让您在 Claude Code 中可以随时调用不同的 LLM 服务。

## 功能特色

- ✅ 支持所有 OpenAI API 兼容的服务
- ✅ 多配置管理，可同时连接多个 LLM 来源
- ✅ 环境变量配置，方便部署
- ✅ TypeScript 开发，类型安全

## 安装

```bash
npm install
npm run build

# 复制环境文件并编辑您的配置
cp .env.example .env
# 然后编辑 .env 文件，填入您的 API 密钥和设置
```

## 配置

### 环境变量

```bash
# 默认配置
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# 多配置支持 (JSON 格式)
LLM_CONFIGS='[
  {
    "name": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-...",
    "model": "gpt-4"
  },
  {
    "name": "local",
    "baseUrl": "http://localhost:8080/v1",
    "model": "qwen"
  }
]'
```

### 支持的服务

- OpenAI API
- Azure OpenAI
- Local AI (Ollama, vLLM, Text Generation Inference)
- 任何 OpenAI 兼容的 API 端点

## 使用方法

### 1. 启动 MCP 服务器

```bash
npm start
```

### 2. 在 Claude Code 中配置

#### 选项 1: 手动配置
在 Claude Code 的设置中加入：

```json
{
  "mcpServers": {
    "openai-client": {
      "command": "node",
      "args": ["/path/to/your/mcp-openai-client/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### 选项 2: 使用 Claude CLI
您也可以使用 Claude CLI 命令来添加 MCP 服务器：

```bash
claude mcp add openai-client node /path/to/your/mcp-openai-client/dist/index.js
```

将 `/path/to/your/mcp-openai-client/dist/index.js` 替换为您编译后的 index.js 文件的实际路径。

### 3. 在 Claude Code 中调用 LLM

在 Claude Code 中使用自然语言提示词来引用您配置的 LLM：

```
'qwen' 是配置的 MCP openai-client 的 Qwen 模型连接。请使用 'qwen' 来帮我分析这份技术文档并提供摘要。
```

```
使用 qwen，请帮我生成数据处理的 Python 代码。
```

```
请使用 MCP openai-client 的默认配置来帮我将这段文字翻译成法文。OpenAI 模型应该能很好地处理翻译任务。
```

进阶使用时，您也可以直接使用工具：

```javascript
// 调用特定配置 (Qwen 模型)
const result = await mcp.callTool('llm-complete', {
  prompt: '编写处理 CSV 数据的 Python 函数',
  configName: 'local',  // 使用 Qwen 配置
  maxTokens: 1000
});

// 列出可用配置
const configs = await mcp.callTool('llm-list-configs', {});
```

## 工具方法

### `llm-complete`

发送提示词到 LLM 并获取回应。

**参数：**
- `prompt` (string): 要发送的提示词
- `configName` (string, optional): 配置名称，默认为 'default'
- `temperature` (number, optional): 温度参数 (0.0 到 2.0)
- `maxTokens` (number, optional): 最大 token 数

**返回：**
```typescript
{
  content: [{
    type: 'text',
    text: string      // LLM 回应内容
  }],
  isError: boolean    // 是否发生错误
}
```

### `llm-list-configs`

列出所有可用的 LLM 配置。

**返回：**
```typescript
{
  content: [{
    type: 'text',
    text: string      // JSON 格式的配置列表
  }],
  isError: boolean    // 是否发生错误
}
```

## 开发

```bash
# 开发模式 (监听文件变化)
npm run dev

# 编译 TypeScript
npm run build

# 执行编译后的程序
npm run start
```

## 授权

MIT License