import { Plugin, PluginConfig, PluginContext } from '../types/plugin';
import chalk from 'chalk';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginConfigs: Map<string, PluginConfig> = new Map();

  async register(plugin: Plugin): Promise<void> {
    this.plugins.set(plugin.id, plugin);
    this.pluginConfigs.set(plugin.id, {});
    console.log(chalk.green(`[Plugin] Registered: ${plugin.name} v${plugin.version}`));
  }

  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.destroy();
      this.plugins.delete(pluginId);
      this.pluginConfigs.delete(pluginId);
      console.log(chalk.yellow(`[Plugin] Unregistered: ${pluginId}`));
    }
  }

  async init(pluginId: string, config?: PluginConfig): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    if (config) {
      this.pluginConfigs.set(pluginId, config);
    }
    await plugin.init(this.pluginConfigs.get(pluginId) || {});
  }

  async execute(pluginId: string, ctx: PluginContext): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    return plugin.execute(ctx);
  }

  async destroy(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.destroy();
    }
  }

  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async triggerHook(hookName: string, ctx: PluginContext, result?: any): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks && hookName in plugin.hooks) {
        try {
          const hook = plugin.hooks[hookName as keyof typeof plugin.hooks];
          if (hook) {
            await (hook as any)(ctx, result);
          }
        } catch (error) {
          console.warn(chalk.red(`[Plugin] Hook ${hookName} failed for ${plugin.id}: ${error}`));
        }
      }
    }
  }
}
