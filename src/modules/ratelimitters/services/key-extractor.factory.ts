import { Injectable } from "@nestjs/common";
import { KeyExtractor } from "../interfaces/key-extractor.interface";
import { PreConnectKeyExtractor as RestPreConnect } from "../providers/key-extractor/rest/pre-connect.status";
import { PostConnectKeyExtractor as RestPostConnect } from "../providers/key-extractor/rest/post-connect.status";
import { PreConnectKeyExtractor as WsPreConnect } from "../providers/key-extractor/ws/pre-connect.status";
import type { TransportType } from "../types/transport.type";
import { RuleNameType } from "../types/rulename.type";

@Injectable()
export class KeyExtractorFactory {
  private extractors: Map<TransportType, Map<string, KeyExtractor>>;

  constructor(
    restPreConnect: RestPreConnect,
    restPostConnect: RestPostConnect,
    wsPreConnect: WsPreConnect
  ) {

    this.extractors = new Map([
      [
        'rest',
        new Map([
          ['preConnect', restPreConnect],
          ['postConnect', restPostConnect],
        ])
      ],
      [
        'ws',
        new Map([
          ['preConnect', wsPreConnect]
        ])
      ]
    ]);

  }

  getExtractor(transport: TransportType, ruleName: RuleNameType): KeyExtractor {

    const transportMap = this.extractors.get(transport);

    if (!transportMap) {
      throw new Error(`No transport extractor for ${transport}`);
    }

    const extractor = transportMap.get(ruleName);

    if (!extractor) {
      throw new Error(`No key extractor for rule ${ruleName}`);
    }

    return extractor;
  }
}