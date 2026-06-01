import { Command } from 'commander';
import { registerCommands } from './commands/index';
import { loadConfig } from './config/manager';

export async function main(): Promise<void> {
  const program = new Command();

  program
    .name('opencode')
    .description('A modern CLI tool for intelligent code management and automation')
    .version('1.0.0')
    .option('-c, --config <path>', 'Path to config file')
    .option('--no-color', 'Disable colored output');

  await loadConfig(program.opts().config);

  registerCommands(program);

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

main().catch(console.error);
