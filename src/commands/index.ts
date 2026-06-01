import { Command } from 'commander';
import { registerHelloCommand } from './hello';
import { registerChatCommand } from './chat';
import { registerSettingsCommand } from './settings';
import { registerTasksCommand } from './tasks';

export function registerCommands(program: Command): void {
  registerHelloCommand(program);
  registerChatCommand(program);
  registerSettingsCommand(program);
  registerTasksCommand(program);
}
