// lifecycle.interface.ts
export interface ILifecycle {
  onConnect(): Promise<void> | void;
  onDisconnect(): Promise<void> | void;
  destroy(): void;
}