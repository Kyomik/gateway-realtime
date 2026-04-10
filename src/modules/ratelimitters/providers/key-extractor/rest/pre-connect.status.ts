import { Injectable } from "@nestjs/common";
import { KeyExtractor } from "../../../interfaces/key-extractor.interface";

@Injectable()
export class PreConnectKeyExtractor implements KeyExtractor {
  extract(req: any): string {
    return req.body?.client_id ? req.body.client_id : req.ip;
  }
}
