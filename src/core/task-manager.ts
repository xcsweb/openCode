import { Task, TaskContext, Message, Checkpoint, TaskManager } from '../types/task';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class TaskManagerImpl implements TaskManager {
  private tasks: Map<string, Task> = new Map();
  private currentTaskId: string | null = null;
  private storagePath: string;
  private loaded: boolean = false;

  constructor(storagePath?: string) {
    this.storagePath = storagePath || path.join(os.homedir(), '.opencode', 'tasks');
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    try {
      if (fs.existsSync(this.storagePath)) {
        const files = await fs.promises.readdir(this.storagePath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = await fs.promises.readFile(path.join(this.storagePath, file), 'utf-8');
            const task = JSON.parse(content);
            this.tasks.set(task.id, task);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load tasks from storage.');
    }
    this.loaded = true;
  }

  private async saveTask(task: Task): Promise<void> {
    if (!fs.existsSync(this.storagePath)) {
      await fs.promises.mkdir(this.storagePath, { recursive: true });
    }
    const filePath = path.join(this.storagePath, `${task.id}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(task, null, 2), 'utf-8');
  }

  async createTask(name: string, options?: Partial<Task>): Promise<Task> {
    await this.ensureLoaded();
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = Date.now();
    const task: Task = {
      id,
      name,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      priority: 0,
      context: {
        messages: [],
        files: [],
        variables: {},
      },
      ...options,
    };
    this.tasks.set(id, task);
    await this.saveTask(task);
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.ensureLoaded();
    const filePath = path.join(this.storagePath, `${taskId}.json`);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
    this.tasks.delete(taskId);
    if (this.currentTaskId === taskId) {
      this.currentTaskId = null;
    }
  }

  async listTasks(): Promise<Task[]> {
    await this.ensureLoaded();
    return Array.from(this.tasks.values()).sort((a, b) => b.priority - a.priority);
  }

  async switchTask(taskId: string): Promise<Task> {
    await this.ensureLoaded();
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    this.currentTaskId = taskId;
    return task;
  }

  async pauseTask(taskId: string): Promise<void> {
    await this.ensureLoaded();
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = 'paused';
    task.updatedAt = Date.now();
    await this.saveTask(task);
  }

  async resumeTask(taskId: string): Promise<void> {
    await this.ensureLoaded();
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = task.status === 'interrupted' ? 'running' : task.status;
    if (task.status === 'pending' || task.status === 'paused') {
      task.status = 'running';
    }
    task.updatedAt = Date.now();
    await this.saveTask(task);
  }

  async interruptTask(taskId: string): Promise<void> {
    await this.ensureLoaded();
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    await this.saveCheckpoint(taskId);
    task.status = 'interrupted';
    task.updatedAt = Date.now();
    await this.saveTask(task);
  }

  async saveCheckpoint(taskId: string): Promise<void> {
    await this.ensureLoaded();
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    const checkpoint: Checkpoint = {
      savedAt: Date.now(),
      messages: [...task.context.messages],
      variables: { ...task.context.variables },
    };
    task.context.checkpoint = checkpoint;
    await this.saveTask(task);
  }

  async restoreCheckpoint(taskId: string): Promise<Task> {
    await this.ensureLoaded();
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (!task.context.checkpoint) {
      throw new Error(`No checkpoint found for task: ${taskId}`);
    }
    task.context.messages = [...task.context.checkpoint.messages];
    task.context.variables = { ...task.context.checkpoint.variables };
    task.status = 'running';
    task.updatedAt = Date.now();
    await this.saveTask(task);
    return task;
  }

  getCurrentTask(): Task | null {
    if (!this.currentTaskId) return null;
    return this.tasks.get(this.currentTaskId) || null;
  }
}
