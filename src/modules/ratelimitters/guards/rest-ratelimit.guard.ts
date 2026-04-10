// src/modules/rate-limit/guards/rest-ratelimit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeyExtractorFactory } from '../services/key-extractor.factory';
import { RateLimitService } from '../services/rate-limit.service';
import { RATE_LIMIT_RULE } from '../decorators/ratelimit.decorator';
import { BaseRateLimitGuard } from './base-ratelimit.guard';

@Injectable()
export class RestRateLimitGuard extends BaseRateLimitGuard implements CanActivate {
  protected readonly transport = 'rest';

  constructor(
    private readonly reflector: Reflector,
    keyExtractorFactory: KeyExtractorFactory,
    rateLimitService: RateLimitService,
  ) {
    super(keyExtractorFactory, rateLimitService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ruleName = this.reflector.get<string>(RATE_LIMIT_RULE, context.getHandler());
    if (!ruleName) return true;
    
    if (ruleName !== 'preConnect' && ruleName !== 'postConnect') {
      throw new Error(`Invalid rule name: ${ruleName}`);
    }

    const req = context.switchToHttp().getRequest();

    await this.execute(req, ruleName);

    return true;
  }
}