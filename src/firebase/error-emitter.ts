import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type PermissionErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class PermissionErrorEmitter extends EventEmitter {
  constructor() {
    super();
  }

  emit<E extends keyof PermissionErrorEvents>(
    event: E,
    ...args: Parameters<PermissionErrorEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<E extends keyof PermissionErrorEvents>(
    event: E,
    listener: PermissionErrorEvents[E]
  ): this {
    return super.on(event, listener);
  }
}

export const errorEmitter = new PermissionErrorEmitter();
