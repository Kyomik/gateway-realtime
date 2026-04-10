import { Injectable } from "@nestjs/common";
import { KeyExtractor } from "../../../interfaces/key-extractor.interface";
import { IncomingMessage } from "http";

@Injectable()
export class PreConnectKeyExtractor implements KeyExtractor {
    extract(req: any): string {
        const ip = this.getClientIp(req)
        const token = this.extractToken(req)
        
        return token ? `${ip}:${token}` : ip;
    }

    private getClientIp(req: IncomingMessage): string {
        const forwarded = req.headers['x-forwarded-for'];
        
        if (forwarded && typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        return req.socket?.remoteAddress || 'unknown';
    }

    private extractToken(req: IncomingMessage): string | undefined {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        return url.searchParams.get('token') || undefined;
    }
}
