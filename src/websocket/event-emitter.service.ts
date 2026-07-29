import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface AppEvent {
  event: string;
  data: Record<string, unknown>;
}

@Injectable()
export class EventEmitterService implements OnModuleDestroy {
  private readonly emitter = new EventEmitter();

  emit(event: string, data: Record<string, unknown>): void {
    this.emitter.emit(event, { event, data });
  }

  on(event: string, listener: (payload: AppEvent) => void): void {
    this.emitter.on(event, listener);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }

  onModuleDestroy(): void {
    this.emitter.removeAllListeners();
  }
}
