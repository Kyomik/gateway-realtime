import { Injectable } from "@nestjs/common";
import { KeyExtractor } from "../../../interfaces/key-extractor.interface";

@Injectable()
export class PostConnectKeyExtractor implements KeyExtractor {
  extract(req: any): string {
    const authHeader = req.headers.authorization;

    return authHeader ? authHeader : req.ip;
  }
}