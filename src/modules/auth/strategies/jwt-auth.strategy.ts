import { Injectable } from "@nestjs/common";
import { IAuthStrategy } from "../interfaces/auth-strategy.interface";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { BrowserUser } from "src/commons/schemas/browser.principal";
import { BrowserService } from "src/modules/auth/services/browser.service";
import { AppWsException } from "src/commons/exceptions/ws-error.exception";
import { AuthResult } from "src/modules/auth/types/auth-result.type";

@Injectable()
export class JwtAuthStrategy implements IAuthStrategy {
  constructor(
    private readonly jwtService: JwtService,
    private readonly browserService: BrowserService,
    private readonly config: ConfigService
  ) {}

  async validate(token: string): Promise<AuthResult> {
    try{
      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
      const authData = await this.browserService.getAuth(payload.client_id, payload.role);
      
      return {
        auth: new BrowserUser(authData), 
        id_enduser: authData.id_enduser
      };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppWsException(
          'TOKEN_EXPIRED',
          'JWT token expired',
        );
      }

      if (err.name === 'JsonWebTokenError') {
        throw new AppWsException(
          'INVALID_TOKEN',
          'Invalid JWT token',
        );
      }

      throw new AppWsException(
        'UNAUTHENTICATED',
        'JWT authentication failed',
      );
    }
  }
}
