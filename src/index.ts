import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';
import { LLMConfig, loadConfigs, getConfigByName } from './config.js';

interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIClientMCP {
  private server: McpServer;
  private configs: LLMConfig[];

  constructor() {
    this.server = new McpServer(
      {
        name: 'openai-mcp-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    this.configs = this.loadConfigs();
    this.setupTools();
  }

  private loadConfigs(): LLMConfig[] {
    return loadConfigs();
  }

  private setupTools() {
    this.server.tool(
      'llm-complete',
      'Call an OpenAI-compatible LLM with a prompt',
      {
        prompt: z.string().describe('The prompt to send to the LLM'),
        configName: z.string().optional().describe('Name of the LLM configuration to use (default: default)'),
        temperature: z.number().optional().describe('Temperature for sampling (0.0 to 2.0)'),
        maxTokens: z.number().optional().describe('Maximum number of tokens to generate')
      },
      async ({ prompt, configName = 'default', temperature, maxTokens }) => {
        const config = getConfigByName(configName, this.configs);
        
        try {
          const response = await this.callLLM({
            prompt,
            config: {
              ...config,
              temperature: temperature ?? config.temperature,
              maxTokens: maxTokens ?? config.maxTokens
            }
          });

          return {
            content: [{
              type: 'text',
              text: response.content
            }],
            isError: false
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'llm-list-configs',
      'List available LLM configurations',
      {},
      async () => {
        const configList = this.configs.map(config => ({
          name: config.name,
          model: config.model,
          baseUrl: config.baseUrl
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(configList, null, 2)
          }],
          isError: false
        };
      }
    );
  }

  private async callLLM(params: { prompt: string; config: LLMConfig }): Promise<LLMResponse> {
    const { prompt, config } = params;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const requestData = {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    };

    try {
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        requestData,
        { headers }
      );

      const result = response.data;
      
      return {
        content: result.choices[0]?.message?.content || '',
        model: result.model,
        usage: result.usage
      };
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(`API Error: ${error.response.data.error.message}`);
      }
      throw error;
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OpenAI MCP Client started');
  }
}

const server = new OpenAIClientMCP();
server.start().catch(console.error);