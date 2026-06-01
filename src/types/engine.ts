export interface TaskScheduler {
  schedule(taskId: string): Promise<void>;
  cancel(taskId: string): Promise<void>;
  pause(taskId: string): Promise<void>;
  resume(taskId: string): Promise<void>;
  getStatus(taskId: string): Promise<TaskStatus>;
}

export interface TaskStatus {
  taskId: string;
  state: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'interrupted';
  progress: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface EventBus {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  once(event: string, handler: (...args: any[]) => void): void;
}

export interface FlowController {
  start(taskId: string): Promise<void>;
  stop(taskId: string): Promise<void>;
  interrupt(taskId: string): Promise<void>;
  getNextStep(taskId: string): Promise<any>;
}
