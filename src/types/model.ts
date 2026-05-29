export interface Model {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  apiUrl: string;
  modelName: string;
  capabilities: ModelCapability[];
  group: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}

export type ModelCapability =
  | 'text-generation'
  | 'image-understanding'
  | 'code-generation'
  | 'code-analysis'
  | 'frontend-expert'
  | 'backend-expert'
  | 'devops-expert'
  | 'architecture-expert'
  | 'database-expert'
  | 'test-expert';

export interface Expert {
  id: string;
  name: string;
  systemPrompt: string;
  modelId: string;
  specialties: string[];
}

export type RoutingStrategy = 'auto' | 'round-robin' | 'fixed' | 'user-select';

export interface RoutingRule {
  taskType: string;
  requiredCapabilities: ModelCapability[];
  preferredExpertId?: string;
  fallbackExpertId?: string;
  priority: number;
}
