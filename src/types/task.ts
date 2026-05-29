export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'interrupted';
  createdAt: number;
  updatedAt: number;
  context: TaskContext;
  priority: number;
  modelId?: string;
  expertId?: string;
}

export interface TaskContext {
  messages: Message[];
  files: string[];
  variables: Record<string, any>;
  checkpoint?: Checkpoint;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Checkpoint {
  savedAt: number;
  messages: Message[];
  variables: Record<string, any>;
}

export interface TaskManager {
  createTask(name: string, options?: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  listTasks(): Promise<Task[]>;
  switchTask(taskId: string): Promise<Task>;
  pauseTask(taskId: string): Promise<void>;
  resumeTask(taskId: string): Promise<void>;
  interruptTask(taskId: string): Promise<void>;
  saveCheckpoint(taskId: string): Promise<void>;
  restoreCheckpoint(taskId: string): Promise<Task>;
  getCurrentTask(): Task | null;
}
