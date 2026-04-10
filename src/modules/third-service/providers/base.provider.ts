import { IProviderFactory } from '../interfaces/provider-factory.interface';
import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export abstract class BaseProviderFactory<T> implements IProviderFactory<T> {
    @Inject(ConfigService)
    protected readonly configService: ConfigService

    abstract create(clientId: number, provider?: string): Promise<T>;
}