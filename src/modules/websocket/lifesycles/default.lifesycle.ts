import { ILifecycle } from "./lifecycle.interface";

export class DefaultLifecycle implements ILifecycle {

  async onConnect() {
    // this.client.close(1008, 'Invalid or unsupported client');
  }

  async onDisconnect() {
  }

  async destroy(): Promise<void> {
    
  }
}