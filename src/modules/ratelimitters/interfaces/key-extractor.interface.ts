export interface KeyExtractor {
  extract(req: any): Promise<string> | string;
}