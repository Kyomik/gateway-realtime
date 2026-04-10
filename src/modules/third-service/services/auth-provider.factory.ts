// factories/auth-provider.factory.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseConfigEntity } from '../../../commons/entities/firebase_config.entity';
import { IAuthProvider } from '../interfaces/auth.provider.interface.';
import { FirebaseProvider } from '../providers/auth/firebase.provider';
import { BaseProviderFactory } from '../providers/base.provider';

@Injectable()
export class AuthProviderFactory extends BaseProviderFactory<IAuthProvider>{
  constructor(
    @InjectRepository(FirebaseConfigEntity)
    private readonly firebaseConfigRepo: Repository<FirebaseConfigEntity>,
  ) {
    super()
  }

  async create(clientId: number, provider?: string): Promise<IAuthProvider> {
    const providerType = provider || this.configService.get('DEFAULT_AUTH_PROVIDER') || 'firebase';
    switch (providerType) {
      case 'firebase': {
        const config = await this.firebaseConfigRepo.findOne({ where: { clientId } });
        if (!config) {
          throw new Error(`Firebase config not found for client ${clientId}`);
        }
        
        return new FirebaseProvider({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
          clientId,
        });
      }
      default:
        throw new Error(`Unsupported auth provider: ${providerType}`);
    }
  }
}