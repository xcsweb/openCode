import chalk from 'chalk';
import { Command } from 'commander';

export function registerChatCommand(program: Command): void {
  program
    .command('chat')
    .description('Start an interactive chat session with openCode AI')
    .option('-m, --model <model>', 'Specify which model to use')
    .option('-e, --expert <expert>', 'Specify which expert to use')
    .action(async (opts: { model?: string; expert?: string }) => {
      console.log(chalk.green('Starting openCode AI chat session...'));
      console.log(chalk.dim('Type your message and press Enter to send.'));
      console.log(chalk.dim('Commands: /help, /exit, /new, /tasks, /settings\n'));

      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const prompt = () => {
        rl.question(chalk.blue('> You: '), async (input) => {
          const trimmed = input.trim();

          if (trimmed === '/exit' || trimmed === '/quit') {
            console.log(chalk.yellow('Goodbye!'));
            rl.close();
            process.exit(0);
          }

          if (trimmed === '/help') {
            console.log(chalk.cyan('\nAvailable commands:'));
            console.log('  /help     - Show this help');
            console.log('  /exit     - Exit chat session');
            console.log('  /new      - Start new conversation');
            console.log('  /tasks    - List active tasks');
            console.log('  /settings - Show current settings\n');
            prompt();
            return;
          }

          if (trimmed === '/tasks') {
            console.log(chalk.cyan('\nNo active tasks yet.'));
            prompt();
            return;
          }

          if (trimmed === '/settings') {
            console.log(chalk.cyan('\nCurrent settings:'));
            console.log(`  Model: ${opts.model || 'default'}`);
            console.log(`  Expert: ${opts.expert || 'default'}\n`);
            prompt();
            return;
          }

          if (trimmed === '/new') {
            console.log(chalk.yellow('Starting new conversation...\n'));
            prompt();
            return;
          }

          if (trimmed) {
            console.log(chalk.dim('Thinking...\n'));
            console.log(chalk.green('openCode: This is a placeholder response.'));
            console.log(chalk.dim('AI model integration coming soon.\n'));
          }

          prompt();
        });
      };

      prompt();
    });
}
