import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface OpenCodeConfig {
  apiKeys?: {
    groq?: string;
    openrouter?: string;
    openai?: string;
    anthropic?: string;
  };
  defaultModel?: string;
  models: ModelConfig[];
  experts: ExpertConfig[];
  plugins: PluginConfig;
  ui: UIConfig;
  performance: PerformanceConfig;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey?: string;
  apiUrl?: string;
  modelName: string;
  capabilities: string[];
  group: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ExpertConfig {
  id: string;
  name: string;
  systemPrompt: string;
  modelId: string;
  specialties: string[];
}

export interface PluginConfig {
  enabled: string[];
  disabled: string[];
  permissions: Record<string, string>;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  streaming: boolean;
  typingSpeed: number;
  highlightTheme: string;
}

export interface PerformanceConfig {
  maxConcurrentTasks: number;
  maxContextWindow: number;
  cacheSize: number;
  cacheExpiry: number;
}

const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.opencode', 'config.json');

export const PRESET_PROVIDERS = {
  groq: {
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    apiUrl: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
    ],
  },
};

const DEFAULT_CONFIG: OpenCodeConfig = {
  apiKeys: {},
  defaultModel: 'groq/llama-3.3-70b-versatile',
  models: [
    {
      id: 'groq/llama-3.3-70b-versatile',
      name: 'Groq Llama 3.3 70B',
      provider: 'groq',
      modelName: 'llama-3.3-70b-versatile',
      apiUrl: 'https://api.groq.com/openai/v1',
      capabilities: ['text-generation', 'code-generation', 'code-analysis'],
      group: 'default',
      maxTokens: 8192,
      temperature: 0.7,
      topP: 1,
    },
  ],
  experts: [
    {
      id: 'default',
      name: 'General Assistant',
      systemPrompt: 'You are a helpful assistant.',
      modelId: 'groq/llama-3.3-70b-versatile',
      specialties: ['general'],
    },
  ],
  plugins: {
    enabled: [],
    disabled: [],
    permissions: {},
  },
  ui: {
    theme: 'dark',
    streaming: true,
    typingSpeed: 10,
    highlightTheme: 'github-dark',
  },
  performance: {
    maxConcurrentTasks: 4,
    maxContextWindow: 128000,
    cacheSize: 100,
    cacheExpiry: 3600,
  },
};

let currentConfig: OpenCodeConfig | null = null;

export async function loadConfig(configPath?: string): Promise<OpenCodeConfig> {
  if (currentConfig) {
    return currentConfig;
  }

  const pathToLoad = configPath || DEFAULT_CONFIG_PATH;

  try {
    if (fs.existsSync(pathToLoad)) {
      const configContent = await fs.promises.readFile(pathToLoad, 'utf-8');
      currentConfig = { ...DEFAULT_CONFIG, ...JSON.parse(configContent) };
    } else {
      currentConfig = DEFAULT_CONFIG;
    }
  } catch (error) {
    console.warn(`Failed to load config from ${pathToLoad}, using defaults.`);
    currentConfig = DEFAULT_CONFIG;
  }

  return currentConfig!;
}

export async function saveConfig(config: OpenCodeConfig, configPath?: string): Promise<void> {
  const pathToSave = configPath || DEFAULT_CONFIG_PATH;
  const dir = path.dirname(pathToSave);

  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  await fs.promises.writeFile(pathToSave, JSON.stringify(config, null, 2), 'utf-8');
  currentConfig = config;
}

export function getConfig(): OpenCodeConfig {
  if (!currentConfig) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return currentConfig;
}

export async function updateConfig(updates: Partial<OpenCodeConfig>): Promise<OpenCodeConfig> {
  const config = getConfig();
  const updated = { ...config, ...updates };
  await saveConfig(updated);
  return updated;
}

export async function setApiKey(provider: string, key: string): Promise<OpenCodeConfig> {
  const config = await loadConfig();
  if (!config.apiKeys) config.apiKeys = {};
  config.apiKeys[provider as keyof typeof config.apiKeys] = key;
  await saveConfig(config);
  return config;
}

export async function getApiKey(provider: string): Promise<string | undefined> {
  const config = await loadConfig();
  return config.apiKeys?.[provider as keyof typeof config.apiKeys];
}

export function getConfigPath(): string {
  return DEFAULT_CONFIG_PATH;
}

export function ensureConfigDir(): void {
  const dir = path.dirname(DEFAULT_CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
