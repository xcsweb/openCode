import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { loadConfig, saveConfig, setApiKey, getConfigPath, PRESET_PROVIDERS } from '../config/manager';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function runSetupWizard(): Promise<void> {
  console.log(chalk.cyan('\n=== openCode Setup Wizard ===\n'));
  console.log('Let\'s get you set up with openCode!');
  console.log('We\'ll guide you through the configuration process.\n');

  const config = await loadConfig();

  console.log(chalk.bold('Step 1: Select your AI provider'));
  console.log('Available providers:');
  Object.entries(PRESET_PROVIDERS).forEach(([key, provider]) => {
    console.log(chalk.green(`  ${key.toUpperCase()}: ${provider.name}`));
  });

  let providerChoice = await question('\nEnter provider (groq/openrouter) [groq]: ');
  providerChoice = providerChoice.trim().toLowerCase() || 'groq';

  if (!PRESET_PROVIDERS[providerChoice as keyof typeof PRESET_PROVIDERS]) {
    console.log(chalk.yellow(`Unknown provider, defaulting to groq`));
    providerChoice = 'groq';
  }

  const provider = PRESET_PROVIDERS[providerChoice as keyof typeof PRESET_PROVIDERS];

  console.log(chalk.cyan(`\nGreat! You chose ${provider.name}.`));
  console.log(chalk.dim(`Please get your API key from:`));
  
  if (providerChoice === 'groq') {
    console.log(chalk.blue('  https://console.groq.com/keys'));
  } else if (providerChoice === 'openrouter') {
    console.log(chalk.blue('  https://openrouter.ai/keys'));
  }

  let apiKey = await question('\nEnter your API key: ');
  apiKey = apiKey.trim();

  if (apiKey) {
    await setApiKey(providerChoice, apiKey);
    console.log(chalk.green('API key saved successfully!'));
  } else {
    console.log(chalk.yellow('No API key entered. You can add it later with `opencode settings api-key`.'));
  }

  console.log(chalk.bold('\nStep 2: Select default model'));
  console.log('Available models:');
  provider.models.forEach((m, i) => {
    console.log(chalk.green(`  ${i + 1}. ${m.name} (${m.id})`));
  });

  let modelChoice = await question('\nEnter model number [1]: ');
  const modelIndex = parseInt(modelChoice) - 1 || 0;
  const selectedModel = provider.models[modelIndex] || provider.models[0];

  config.defaultModel = `${providerChoice}/${selectedModel.id}`;
  
  const existingModelIndex = config.models.findIndex(m => m.id === config.defaultModel);
  if (existingModelIndex === -1) {
    config.models.push({
      id: config.defaultModel,
      name: `${provider.name} ${selectedModel.name}`,
      provider: providerChoice,
      modelName: selectedModel.id,
      apiUrl: provider.apiUrl,
      capabilities: ['text-generation', 'code-generation', 'code-analysis'],
      group: 'default',
      maxTokens: 8192,
      temperature: 0.7,
      topP: 1,
    });
  }

  await saveConfig(config);
  console.log(chalk.green(`\nDefault model set to: ${selectedModel.name}`));

  console.log(chalk.cyan('\n=== Setup Complete! ==='));
  console.log(chalk.dim(`Config file saved to: ${getConfigPath()}`));
  console.log('\nYou can now start using openCode!');
  console.log(chalk.green('  Run: opencode chat\n'));

  rl.close();
}

export function registerSettingsCommand(program: Command): void {
  const settings = program.command('settings').description('Manage openCode settings');

  settings
    .command('setup')
    .description('Run interactive setup wizard')
    .action(runSetupWizard);

  settings
    .command('show')
    .description('Show current settings')
    .action(async () => {
      const config = await loadConfig();
      console.log(chalk.cyan('\n=== openCode Settings ===\n'));
      
      console.log(chalk.bold('Config File:'));
      console.log(chalk.dim(`  ${getConfigPath()}`));

      console.log(chalk.bold('\nAPI Keys:'));
      if (config.apiKeys && Object.keys(config.apiKeys).length > 0) {
        Object.entries(config.apiKeys).forEach(([provider, key]) => {
          const masked = key ? `${key.slice(0, 8)}...${key.slice(-4)}` : 'not set';
          console.log(chalk.green(`  ${provider}: ${masked}`));
        });
      } else {
        console.log(chalk.dim('  No API keys configured'));
      }

      console.log(chalk.bold('\nDefault Model:'));
      console.log(`  ${config.defaultModel || 'not set'}`);

      console.log(chalk.bold('\nModels:'));
      if (config.models.length === 0) {
        console.log(chalk.dim('  No models configured'));
      } else {
        config.models.forEach(m => {
          const isDefault = m.id === config.defaultModel;
          const prefix = isDefault ? '  * ' : '  - ';
          console.log((isDefault ? chalk.green : chalk.white)(`${prefix}${m.name} (${m.provider})`));
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
    .command('api-key')
    .description('Set API key for a provider')
    .argument('<provider>', 'Provider (groq, openrouter, openai, anthropic)')
    .argument('<key>', 'API key')
    .action(async (provider: string, key: string) => {
      await setApiKey(provider, key);
      console.log(chalk.green(`API key for ${provider} saved successfully.`));
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
            const isDefault = m.id === config.defaultModel;
            const prefix = isDefault ? '* ' : '';
            console.log((isDefault ? chalk.green : chalk.white)(`${prefix}${m.id}: ${m.name} (${m.provider})`));
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
        await saveConfig(config);
        console.log(chalk.green(`Expert "${expert.name}" added successfully.`));
      }
    });
}
