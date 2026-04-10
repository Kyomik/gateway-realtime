import { Injectable } from "@nestjs/common";
import { BaseRateLimitGuard } from "./base-ratelimit.guard";
import { TransportType } from "../types/transport.type";
import { KeyExtractorFactory } from "../services/key-extractor.factory";
import { RateLimitService } from "../services/rate-limit.service";
import { IncomingMessage } from "http";

@Injectable()
export class WebsocketRateLimitGuard extends BaseRateLimitGuard{
    protected transport: TransportType = 'ws';

    constructor(
        keyExtractorFactory: KeyExtractorFactory,
        rateLimitService: RateLimitService,
    ) {
        super(keyExtractorFactory, rateLimitService);
    }

    async validate(req: IncomingMessage, rule: string): Promise<void>{
        if (rule !== 'preConnect' && rule !== 'postConnect') {
            throw new Error(`Invalid rule name: ${rule}`);
        }

        await this.execute(req, rule)
    }
}