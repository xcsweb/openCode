import { Command } from 'commander';
import chalk from 'chalk';

export function registerHelloCommand(program: Command): void {
  program
    .command('hello')
    .description('Say hello from openCode')
    .argument('[name]', 'Your name', 'World')
    .action((name: string) => {
      console.log(chalk.green(`Hello, ${name}! Welcome to openCode CLI.`));
      console.log(chalk.dim('Type "opencode chat" to start a conversation.'));
    });
}
