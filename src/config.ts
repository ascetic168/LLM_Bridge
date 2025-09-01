import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface LLMConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export function loadConfigs(): LLMConfig[] {
  // 先載入上層目錄的 .env 檔案，覆蓋現有環境變數
  const envPath = resolve(__dirname, '..', '.env');
  console.log(`Loading .env file from: ${envPath}`);
  
  const result = config({ path: envPath, override: true });
  if (result.error) {
    console.error(`Error loading .env file: ${result.error.message}`);
  } else {
    console.log('.env file loaded successfully');
    if (result.parsed) {
      console.log(`Found ${Object.keys(result.parsed).length} environment variables in .env file`);
    }
  }
  
  const configs: LLMConfig[] = [];

  // 優先解析 LLM_CONFIGS
  let llmConfigsFromEnv: LLMConfig[] = [];
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    console.log(`Read .env file content, length: ${envContent.length} characters`);
    
    // 尋找 LLM_CONFIGS= 開頭的行，然後讀取直到找到完整的 JSON 陣列
    const llmConfigsMatch = envContent.match(/^LLM_CONFIGS\s*=\s*(\[[\s\S]*?\])\s*$/m);
    
    if (llmConfigsMatch && llmConfigsMatch[1]) {
      console.log(`Found LLM_CONFIGS in .env file: ${llmConfigsMatch[1].substring(0, 100).replace(/\s+/g, ' ')}...`);
      try {
        const parsedConfigs = JSON.parse(llmConfigsMatch[1]);
        if (Array.isArray(parsedConfigs)) {
          llmConfigsFromEnv = parsedConfigs;
          console.log(`Parsed ${llmConfigsFromEnv.length} LLM configurations from LLM_CONFIGS`);
        }
      } catch (parseError) {
        console.error('Failed to parse LLM_CONFIGS JSON:', parseError);
        console.log('Raw LLM_CONFIGS content:', llmConfigsMatch[1]);
      }
    } else {
      console.log('No LLM_CONFIGS found in .env file');
      // 顯示更多調試信息
      const llmConfigsLine = envContent.split('\n').find(line => line.startsWith('LLM_CONFIGS'));
      if (llmConfigsLine) {
        console.log('Found LLM_CONFIGS line but could not extract JSON:', llmConfigsLine.substring(0, 100));
      }
    }
  } catch (error) {
    console.error('Failed to parse LLM_CONFIGS from .env file:', error);
  }

  // 如果 LLM_CONFIGS 中有 default 配置，優先使用
  const defaultConfigFromLLM = llmConfigsFromEnv.find(c => c.name === 'default');
  
  if (defaultConfigFromLLM) {
    console.log('Using default configuration from LLM_CONFIGS');
    configs.push(defaultConfigFromLLM);
  } else {
    console.log('Using traditional OPENAI_* environment variables for default configuration');
    // 否則使用傳統的 OPENAI_* 環境變數
    const defaultConfig: LLMConfig = {
      name: 'default',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000')
    };
    console.log(`Default config: ${JSON.stringify({...defaultConfig, apiKey: defaultConfig.apiKey ? '***' : undefined})}`);
    configs.push(defaultConfig);
  }

  // 添加其他來自 LLM_CONFIGS 的配置（排除已經添加的 default 配置）
  const otherConfigs = llmConfigsFromEnv.filter(c => c.name !== 'default');
  if (otherConfigs.length > 0) {
    console.log(`Adding ${otherConfigs.length} additional configurations from LLM_CONFIGS`);
    configs.push(...otherConfigs);
  }

  console.log(`Total configurations loaded: ${configs.length}`);
  configs.forEach((config, index) => {
    console.log(`Config ${index + 1}: ${config.name} (model: ${config.model})`);
  });

  return configs;
}

export function getConfigByName(name: string, configs: LLMConfig[]): LLMConfig {
  console.log(`Looking for configuration: '${name}'`);
  const config = configs.find(c => c.name === name);
  if (!config) {
    console.log(`Configuration '${name}' not found, available configurations: ${configs.map(c => c.name).join(', ')}`);
    // 如果找不到指定的配置，嘗試使用第一個可用的配置
    if (configs.length > 0) {
      console.log(`Using first available configuration: '${configs[0].name}'`);
      return configs[0];
    }
    throw new Error(`Configuration '${name}' not found and no configurations available`);
  }
  console.log(`Found configuration: '${name}' (model: ${config.model})`);
  return config;
}