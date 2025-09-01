# OpenAI-Compatible MCP Client

🌐 **Language**: [English](README.md) | [繁體中文](README_zh-TW.md) | [简体中文](README_zh-CN.md)

An MCP (Model Context Protocol) client for connecting to OpenAI-compatible LLM sources, allowing you to call different LLM services from within Claude Code.

## Features

- ✅ Supports all OpenAI API compatible services
- ✅ Multi-configuration management, can connect to multiple LLM sources simultaneously
- ✅ Environment variable configuration for easy deployment
- ✅ TypeScript development with type safety

## Installation

```bash
npm install
npm run build

# Copy environment file and edit it with your configuration
cp .env.example .env
# Then edit the .env file with your API keys and settings
```

## Configuration

### Environment Variables

```bash
# Default configuration
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# Multi-configuration support (JSON format)
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

### Supported Services

- OpenAI API
- Azure OpenAI
- Local AI (Ollama, vLLM, Text Generation Inference)
- Any OpenAI-compatible API endpoint

## Usage

### 1. Start MCP Server

```bash
npm start
```

### 2. Configure in Claude Code

#### Option 1: Manual Configuration
Add to Claude Code settings:

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

#### Option 2: Using Claude CLI
You can also add the MCP server using the Claude CLI command:

```bash
claude mcp add openai-client node /path/to/your/mcp-openai-client/dist/index.js
```

Replace `/path/to/your/mcp-openai-client/dist/index.js` with the actual path to your compiled index.js file.

### 3. Call LLM in Claude Code

Use natural language prompts in Claude Code that reference your configured LLMs:

```
'qwen' is the Qwen model connection of configured MCP openai-client. Please use 'qwen' to help me analyze this technical document and provide a summary.
```

```
Using qwen, can you help me generate Python code for data processing? 
```

```
Please use the MCP openai-client's default configuration to help me translate this text to French. The OpenAI model should handle translation tasks well.
```

For advanced usage, you can also use the tool directly:

```javascript
// Call specific configuration (Qwen model)
const result = await mcp.callTool('llm-complete', {
  prompt: 'Write a Python function to process CSV data',
  configName: 'local',  // Uses the Qwen configuration
  maxTokens: 1000
});

// List available configurations
const configs = await mcp.callTool('llm-list-configs', {});
```

## Tool Methods

### `llm-complete`

Send prompt to LLM and get response.

**Parameters:**
- `prompt` (string): Prompt to send
- `configName` (string, optional): Configuration name, defaults to 'default'
- `temperature` (number, optional): Temperature parameter (0.0 to 2.0)
- `maxTokens` (number, optional): Maximum tokens

**Returns:**
```typescript
{
  content: [{
    type: 'text',
    text: string      // LLM response content
  }],
  isError: boolean    // Whether an error occurred
}
```

### `llm-list-configs`

List all available LLM configurations.

**Returns:**
```typescript
{
  content: [{
    type: 'text',
    text: string      // Configuration list in JSON format
  }],
  isError: boolean    // Whether an error occurred
}
```

## Development

```bash
# Development mode (watch file changes)
npm run dev

# Compile TypeScript
npm run build

# Run compiled program
npm run start
```

## License

MIT License