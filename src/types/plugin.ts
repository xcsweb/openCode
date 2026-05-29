export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  type: 'official' | 'private' | 'community';
  permissions: PluginPermissions;
  init: (config: PluginConfig) => Promise<void>;
  execute: (ctx: PluginContext) => Promise<any>;
  destroy: () => Promise<void>;
  hooks?: PluginHooks;
}

export interface PluginPermissions {
  fileAccess: 'none' | 'read' | 'write' | 'restricted';
  networkAccess: 'none' | 'internal' | 'external' | 'whitelist';
  terminalAccess: boolean;
  sandboxAccess: boolean;
}

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginContext {
  taskId: string;
  input: any;
  files?: string[];
  variables?: Record<string, any>;
}

export interface PluginHooks {
  beforeTaskStart?: (ctx: PluginContext) => Promise<void>;
  afterTaskFinish?: (ctx: PluginContext, result: any) => Promise<void>;
  onError?: (ctx: PluginContext, error: Error) => Promise<void>;
  onGlobalEvent?: (event: string, data: any) => Promise<void>;
}
