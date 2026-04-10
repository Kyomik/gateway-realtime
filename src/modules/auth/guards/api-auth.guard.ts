import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      request.client = payload;
      return true;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'TOKEN_EXPIRED',
          'JWT token expired',
        );
      }

      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          'INVALID_TOKEN',
          'Invalid JWT token',
        );
      }

      throw new UnauthorizedException(
        'UNAUTHENTICATED',
        'JWT TOKEN failed',
      );
    }
  }
}