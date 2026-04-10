import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientService } from '../../client/client.service';
import { EmailProviderFactory } from './email-provider.factory';
import { AuthProviderFactory } from './auth-provider.factory';
import { CProviderFactory, ProviderFactoryLabelType, ProviderFactoryType } from '../types/provider.type';

@Injectable()
export class ProviderFactory {
  private cache = new Map<string, CProviderFactory>();
  private readonly TTL = 60 * 60 * 1000; // 1 jam (dalam milidetik)

  constructor(
    private readonly clientService: ClientService,
    private readonly emailProviderFactory: EmailProviderFactory,
    private readonly authProviderFactory: AuthProviderFactory,
  ) {}

  async getProvider<T extends ProviderFactoryType = ProviderFactoryType>(
    type: ProviderFactoryLabelType, 
    clientId: string, 
    provider?: string
  ): Promise<T> {

    const key = `${clientId}:${type}:${provider || 'default'}`;
    const cached = this.cache.get(key);
    
    if (cached) {
      clearTimeout(cached.timer);
      const timer = setTimeout(() => this.removeFromCache(key), this.TTL);
      timer.unref();
      cached.timer = timer;
      return cached.instance as T;
    }

    const client = await this.clientService.findByClientId(clientId);
    if (!client) {
      throw new Error(`Client ID not found: ${clientId}`);
    }

    let providerInstance: ProviderFactoryType;
    
    switch (type) {
      case 'email':
        providerInstance = await this.emailProviderFactory.create(client.id, provider);
        break;
      case 'auth':
        providerInstance = await this.authProviderFactory.create(client.id, provider);
        break;
      default:
        throw new UnauthorizedException(`Unsupported provider type: ${type}`);
    }

    const timer = setTimeout(() => this.removeFromCache(key), this.TTL);
    timer.unref();
    this.cache.set(key, { instance: providerInstance, timer });

    return providerInstance as T;
  }

  private removeFromCache(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      clearTimeout(entry.timer);
      this.cache.delete(key);
      // Jika suatu saat provider memerlukan pembersihan (misal koneksi), lakukan di sini
    }
  }

  // Method untuk menghapus cache secara manual (misal saat konfigurasi tenant berubah)
  async invalidate(clientId: string, type: ProviderFactoryLabelType, provider?: string) {
    const key = `${clientId}:${type}:${provider || 'default'}`;
    this.removeFromCache(key);
  }
}