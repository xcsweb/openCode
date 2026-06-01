import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface OpenCodeConfig {
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
  apiKey: string;
  apiUrl: string;
  modelName: string;
  capabilities: string[];
  group: string;
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

const DEFAULT_CONFIG: OpenCodeConfig = {
  models: [],
  experts: [],
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
