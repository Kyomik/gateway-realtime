import { Injectable } from '@nestjs/common';
import { IAuthStrategy } from '../interfaces/auth-strategy.interface';
import { AuthResult } from '../types/auth-result.type';
import { AppWsException } from "src/commons/exceptions/ws-error.exception";
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { BrowserService } from '../services/browser.service';
import { ProviderFactory } from 'src/modules/third-service/services/provider-factory.service';
import { IAuthProvider } from 'src/modules/third-service/interfaces/auth.provider.interface.';

@Injectable()
export class FireBaseAuthStrategy implements IAuthStrategy {
  constructor(
    private readonly browserService: BrowserService,
    private readonly providerFactory: ProviderFactory
  ) {}

  async validate(token: string, clientId?: string): Promise<AuthResult> {
    if (!clientId) {
      throw new AppWsException('UNAUTHENTICATED', 'clientId is required for desktop auth');
    }

    try {
      const app = await this.providerFactory.getProvider<IAuthProvider>('auth', clientId);
      const decoded = await app.verifyIdToken(token);

      let role = decoded.role;
      if (!role) {
        role = 'default'
        // throw new AppWsException('UNAUTHENTICATED', 'Role not found in token');
      }

      const authData = await this.browserService.getAuth(clientId, role);
      return {
        auth: new BrowserUser(authData),
        id_enduser: authData.id_enduser,
      };
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        throw new AppWsException('TOKEN_EXPIRED', 'Token has expired');
      }
      if (error.code === 'auth/argument-error') {
        throw new AppWsException('INVALID_TOKEN', 'Malformed token');
      }
      if (error instanceof AppWsException) throw error;
      throw error
    }
  }
}