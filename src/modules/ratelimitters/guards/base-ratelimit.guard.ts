import { HttpException, HttpStatus } from '@nestjs/common';
import { KeyExtractorFactory } from '../services/key-extractor.factory';
import { RateLimitService } from '../services/rate-limit.service';
import { TransportType } from '../types/transport.type';
import type { RuleNameType } from '../types/rulename.type';

export abstract class BaseRateLimitGuard {
  protected abstract readonly transport: TransportType;

  constructor(
    protected readonly keyExtractorFactory: KeyExtractorFactory,
    protected readonly rateLimitService: RateLimitService,
  ) {}

  /**
   * Eksekusi rate limit berdasarkan request dan ruleName.
   * @throws HttpException jika rate limit terlampaui.
   */
  protected async execute(
    req: any, 
    ruleName: RuleNameType
 ): Promise<void> {

    const extractor = this.keyExtractorFactory.getExtractor(
        this.transport, 
        ruleName
    );
    
    const key = await extractor.extract(req);
    
    const allowed = await this.rateLimitService.allow(
        key, 
        this.transport, 
        ruleName
    );
    
    if (!allowed) {
      const remaining = await this.rateLimitService.getBlockRemaining(key);
      const message = remaining
        ? `Too many requests. Try again in ${Math.ceil(remaining / 1000)} seconds.`
        : 'Too many requests. Try again later.';
      
      throw new HttpException(
        { code: HttpStatus.TOO_MANY_REQUESTS, message },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // await this.rateLimitService.reset(key);
  }
}