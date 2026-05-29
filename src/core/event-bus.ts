import { EventEmitter } from 'events';
import { EventBus } from '../types/engine';

export class EventBusImpl implements EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  on(event: string, handler: (...args: any[]) => void): void {
    this.emitter.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void): void {
    this.emitter.off(event, handler);
  }

  emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }

  once(event: string, handler: (...args: any[]) => void): void {
    this.emitter.once(event, handler);
  }
}
