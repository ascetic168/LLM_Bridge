# OpenAI 相容 MCP 客戶端

🌐 **語言**: [English](README.md) | [繁體中文](README_zh-TW.md) | [简体中文](README_zh-CN.md)

一個用於連接 OpenAI 相容 LLM 來源的 MCP (Model Context Protocol) 客戶端，讓您在 Claude Code 中可以隨時調用不同的 LLM 服務。

## 功能特色

- ✅ 支援所有 OpenAI API 相容的服務
- ✅ 多配置管理，可同時連接多個 LLM 來源
- ✅ 環境變數配置，方便部署
- ✅ TypeScript 開發，型別安全

## 安裝

```bash
npm install
npm run build

# 複製環境檔案並編輯您的配置
cp .env.example .env
# 然後編輯 .env 檔案，填入您的 API 金鑰和設定
```

## 配置

### 環境變數

```bash
# 預設配置
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# 多配置支援 (JSON 格式)
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

### 支援的服務

- OpenAI API
- Azure OpenAI
- Local AI (Ollama, vLLM, Text Generation Inference)
- 任何 OpenAI 相容的 API 端點

## 使用方法

### 1. 啟動 MCP 伺服器

```bash
npm start
```

### 2. 在 Claude Code 中配置

#### 選項 1: 手動配置
在 Claude Code 的設定中加入：

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

#### 選項 2: 使用 Claude CLI
您也可以使用 Claude CLI 命令來新增 MCP 伺服器：

```bash
claude mcp add openai-client node /path/to/your/mcp-openai-client/dist/index.js
```

將 `/path/to/your/mcp-openai-client/dist/index.js` 替換為您編譯後的 index.js 檔案的實際路徑。

### 3. 在 Claude Code 中呼叫 LLM

在 Claude Code 中使用自然語言提示詞來引用您配置的 LLM：

```
'qwen' 是配置的 MCP openai-client 的 Qwen 模型連接。請使用 'qwen' 來幫我分析這份技術文件並提供摘要。
```

```
使用 qwen，請幫我生成資料處理的 Python 程式碼。
```

```
請使用 MCP openai-client 的預設配置來幫我將這段文字翻譯成法文。OpenAI 模型應該能很好地處理翻譯任務。
```

進階使用時，您也可以直接使用工具：

```javascript
// 呼叫特定配置 (Qwen 模型)
const result = await mcp.callTool('llm-complete', {
  prompt: '撰寫處理 CSV 資料的 Python 函數',
  configName: 'local',  // 使用 Qwen 配置
  maxTokens: 1000
});

// 列出可用配置
const configs = await mcp.callTool('llm-list-configs', {});
```

## 工具方法

### `llm-complete`

發送提示詞到 LLM 並取得回應。

**參數：**
- `prompt` (string): 要發送的提示詞
- `configName` (string, optional): 配置名稱，預設為 'default'
- `temperature` (number, optional): 溫度參數 (0.0 到 2.0)
- `maxTokens` (number, optional): 最大 token 數

**回傳：**
```typescript
{
  content: [{
    type: 'text',
    text: string      // LLM 回應內容
  }],
  isError: boolean    // 是否發生錯誤
}
```

### `llm-list-configs`

列出所有可用的 LLM 配置。

**回傳：**
```typescript
{
  content: [{
    type: 'text',
    text: string      // JSON 格式的配置列表
  }],
  isError: boolean    // 是否發生錯誤
}
```

## 開發

```bash
# 開發模式 (監聽檔案變化)
npm run dev

# 編譯 TypeScript
npm run build

# 執行編譯後的程式
npm run start
```

## 授權

MIT License