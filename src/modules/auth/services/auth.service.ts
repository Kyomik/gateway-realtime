import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthStrategy } from '../strategies/jwt-auth.strategy';
import { HmacAuthStrategy } from '../strategies/hmac-auth.strategy';
import { TypeEnduser } from '../../../commons/enums/type-enduser.enum';
import { ClientService } from '../../client/client.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { IAuthStrategy } from '../interfaces/auth-strategy.interface';
import { GenerateTokenDto } from '../dto/generate-token.dto';
import { BrowserService } from './browser.service';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';
import { MockAuthStrategy } from '../strategies/mock.strategy';
import { AuthResult } from 'src/modules/auth/types/auth-result.type';
import { FireBaseAuthStrategy } from '../strategies/firebase-auth.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly strategyMap: Partial<Record<TypeEnduser, IAuthStrategy>>;

  constructor(
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mocStrategy: MockAuthStrategy,
    private readonly hmacStrategy: HmacAuthStrategy,
    private readonly clientService: ClientService,
    private readonly jwtService: JwtService,
    private readonly browserService: BrowserService,
    private readonly fbStrategy: FireBaseAuthStrategy,
    private readonly configService: ConfigService
  ) {
    this.strategyMap = {
      browser: this.jwtStrategy,
      device: this.hmacStrategy,
      // device: this.mocStrategy,
      desktop: this.fbStrategy
    };
  }

  async validateToken(token: string, type: TypeEnduser, clientId?: string): Promise<AuthResult> {
    const strategy = this.strategyMap[type];
    if (!strategy) {
      throw new AppWsException(
        'UNSUPPORTED_AUTH_TYPE',
        `Auth type ${type} is not supported`,
      );
    }
    return await strategy.validate(token, clientId);
  }

  async login(dto: GenerateTokenDto): Promise<{ 
    accessToken: string; 
    refreshToken: string 
    accessTokenExpiry: number;
  }> {
    const result = await this.clientService.exists(dto.client_id, dto.secret_key, dto.role);

    if (!result.client) {
      throw new UnauthorizedException('Client ID not found');
    }
    if (!result.secretValid) {
      throw new UnauthorizedException('Invalid secret key');
    }
    if (!result.roleValid) {
      throw new UnauthorizedException({
        message: 'Role tidak valid',
        availableRoles: await this.browserService.getRoles(result.client),
      });
    }

    const payload = { client_id: dto.client_id, role: dto.role };
    const accessTokenExpiry = dto.access_token_expired || this.configService.get('ACCESS_TOKEN_EXPIRY') || '15m';
    
    const options: JwtSignOptions = { expiresIn: accessTokenExpiry as any };
    const accessToken = this.jwtService.sign(payload, options);

    const refreshToken = await this.refreshTokenService.create(dto.client_id, dto.role);

    return { 
      accessToken, 
      refreshToken, 
      accessTokenExpiry : this.parseExpiry(accessTokenExpiry) 
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.refreshTokenService.validate(refreshToken);
    // revoke token lama
    await this.refreshTokenService.revoke(refreshToken);
    // buat token baru
    const newRefreshToken = await this.refreshTokenService.create(payload.client_id, payload.role);
    const newAccessToken = this.jwtService.sign(
      { client_id: payload.client_id, role: payload.role },
      { expiresIn: '15m' }
    );
    return { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    };
  }

  private parseExpiry(exp: string): number {
    if (exp.endsWith('m')) return parseInt(exp) * 60;
    if (exp.endsWith('h')) return parseInt(exp) * 3600;
    if (exp.endsWith('s')) return parseInt(exp);
    return parseInt(exp);
  }
}
