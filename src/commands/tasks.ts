import { Command } from 'commander';
import chalk from 'chalk';
import { TaskManagerImpl } from '../core/task-manager';

let taskManager: TaskManagerImpl | null = null;

function getTaskManager(): TaskManagerImpl {
  if (!taskManager) {
    taskManager = new TaskManagerImpl();
  }
  return taskManager;
}

export function registerTasksCommand(program: Command): void {
  const tasksCmd = program.command('tasks').description('Manage tasks');

  tasksCmd
    .command('list')
    .alias('ls')
    .description('List all tasks')
    .action(async () => {
      const manager = getTaskManager();
      const tasks = await manager.listTasks();
      if (tasks.length === 0) {
        console.log(chalk.dim('No tasks.'));
        return;
      }
      console.log(chalk.cyan('\n=== Tasks ===\n'));
      tasks.forEach(t => {
        const statusColor = t.status === 'running' ? chalk.green : 
                           t.status === 'paused' ? chalk.yellow :
                           t.status === 'interrupted' ? chalk.red :
                           chalk.dim;
        console.log(`${statusColor(`[${t.status}]`)} ${t.name} (${t.id.slice(0, 12)}...)`);
      });
      console.log('');
    });

  tasksCmd
    .command('create')
    .alias('new')
    .description('Create a new task')
    .argument('<name>', 'Task name')
    .action(async (name: string) => {
      const manager = getTaskManager();
      const task = await manager.createTask(name);
      console.log(chalk.green(`Task created: ${task.name} (${task.id.slice(0, 12)}...)`));
    });

  tasksCmd
    .command('switch')
    .alias('sw')
    .description('Switch to a task')
    .argument('<taskId>', 'Task ID')
    .action(async (taskId: string) => {
      const manager = getTaskManager();
      try {
        const task = await manager.switchTask(taskId);
        console.log(chalk.green(`Switched to task: ${task.name}`));
      } catch (e: any) {
        console.log(chalk.red(e.message));
      }
    });

  tasksCmd
    .command('pause')
    .description('Pause a task')
    .argument('<taskId>', 'Task ID')
    .action(async (taskId: string) => {
      const manager = getTaskManager();
      try {
        await manager.pauseTask(taskId);
        console.log(chalk.yellow(`Task paused: ${taskId.slice(0, 12)}...`));
      } catch (e: any) {
        console.log(chalk.red(e.message));
      }
    });

  tasksCmd
    .command('resume')
    .description('Resume a paused task')
    .argument('<taskId>', 'Task ID')
    .action(async (taskId: string) => {
      const manager = getTaskManager();
      try {
        await manager.resumeTask(taskId);
        console.log(chalk.green(`Task resumed: ${taskId.slice(0, 12)}...`));
      } catch (e: any) {
        console.log(chalk.red(e.message));
      }
    });

  tasksCmd
    .command('interrupt')
    .description('Interrupt a running task (saves checkpoint)')
    .argument('<taskId>', 'Task ID')
    .action(async (taskId: string) => {
      const manager = getTaskManager();
      try {
        await manager.interruptTask(taskId);
        console.log(chalk.red(`Task interrupted (checkpoint saved): ${taskId.slice(0, 12)}...`));
      } catch (e: any) {
        console.log(chalk.red(e.message));
      }
    });

  tasksCmd
    .command('delete')
    .alias('rm')
    .description('Delete a task')
    .argument('<taskId>', 'Task ID')
    .action(async (taskId: string) => {
      const manager = getTaskManager();
      await manager.deleteTask(taskId);
      console.log(chalk.yellow(`Task deleted: ${taskId.slice(0, 12)}...`));
    });
}
