import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig, loadConfig } from '../config/manager';

export function registerSettingsCommand(program: Command): void {
  const settings = program.command('settings').description('Manage openCode settings');

  settings
    .command('show')
    .description('Show current settings')
    .action(async () => {
      const config = await loadConfig();
      console.log(chalk.cyan('\n=== openCode Settings ===\n'));
      
      console.log(chalk.bold('Models:'));
      if (config.models.length === 0) {
        console.log(chalk.dim('  No models configured'));
      } else {
        config.models.forEach(m => {
          console.log(chalk.green(`  - ${m.name} (${m.provider})`));
          console.log(chalk.dim(`    Capabilities: ${m.capabilities.join(', ') || 'none'}`));
        });
      }

      console.log(chalk.bold('\nExperts:'));
      if (config.experts.length === 0) {
        console.log(chalk.dim('  No experts configured'));
      } else {
        config.experts.forEach(e => {
          console.log(chalk.green(`  - ${e.name}`));
          console.log(chalk.dim(`    Model: ${e.modelId}`));
        });
      }

      console.log(chalk.bold('\nUI:'));
      console.log(`  Theme: ${config.ui.theme}`);
      console.log(`  Streaming: ${config.ui.streaming}`);
      console.log(`  Typing Speed: ${config.ui.typingSpeed}ms`);

      console.log(chalk.bold('\nPerformance:'));
      console.log(`  Max Concurrent Tasks: ${config.performance.maxConcurrentTasks}`);
      console.log(`  Max Context Window: ${config.performance.maxContextWindow}`);
      console.log('');
    });

  settings
    .command('model')
    .description('Manage models')
    .argument('<action>', 'Action: add, remove, list')
    .option('-n, --name <name>', 'Model name')
    .option('-p, --provider <provider>', 'Provider (openai, anthropic, google, etc.)')
    .option('-k, --api-key <key>', 'API key')
    .option('-u, --api-url <url>', 'API URL')
    .option('-m, --model-name <name>', 'Model name (e.g., gpt-4, claude-3)')
    .action(async (action: string, opts: any) => {
      const config = await loadConfig();

      if (action === 'list') {
        if (config.models.length === 0) {
          console.log(chalk.dim('No models configured.'));
        } else {
          config.models.forEach(m => {
            console.log(chalk.green(`${m.id}: ${m.name} (${m.provider})`));
          });
        }
      } else if (action === 'add') {
        const model = {
          id: `model_${Date.now()}`,
          name: opts.name || 'Unknown',
          provider: opts.provider || 'openai',
          apiKey: opts.apiKey || '',
          apiUrl: opts.apiUrl || '',
          modelName: opts.modelName || '',
          capabilities: [],
          group: 'default',
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1,
        };
        config.models.push(model);
        const { saveConfig } = await import('../config/manager');
        await saveConfig(config);
        console.log(chalk.green(`Model "${model.name}" added successfully.`));
      } else if (action === 'remove') {
        console.log(chalk.yellow('Use /settings model remove <id> to remove a model.'));
      }
    });

  settings
    .command('expert')
    .description('Manage experts')
    .argument('<action>', 'Action: add, list')
    .option('-n, --name <name>', 'Expert name')
    .option('-p, --prompt <prompt>', 'System prompt')
    .option('-m, --model <modelId>', 'Model ID')
    .action(async (action: string, opts: any) => {
      const config = await loadConfig();

      if (action === 'list') {
        if (config.experts.length === 0) {
          console.log(chalk.dim('No experts configured.'));
        } else {
          config.experts.forEach(e => {
            console.log(chalk.green(`${e.id}: ${e.name} (${e.specialties.join(', ')})`));
          });
        }
      } else if (action === 'add') {
        const expert = {
          id: `expert_${Date.now()}`,
          name: opts.name || 'Unknown',
          systemPrompt: opts.prompt || '',
          modelId: opts.model || '',
          specialties: [],
        };
        config.experts.push(expert);
        const { saveConfig } = await import('../config/manager');
        await saveConfig(config);
        console.log(chalk.green(`Expert "${expert.name}" added successfully.`));
      }
    });
}
