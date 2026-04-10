export interface IProviderFactory<T> {
  create(clientId: number, provider?: string): Promise<T>;
}