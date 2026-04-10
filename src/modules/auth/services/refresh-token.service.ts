import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { randomUUID } from 'crypto';
import { ClientService } from 'src/modules/client/client.service';
import { RefreshTokenEntity } from 'src/commons/entities/refresh_tokens.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repo: Repository<RefreshTokenEntity>,
    private readonly clientService: ClientService,
    private readonly configService: ConfigService
  ) {}

  async create(clientId: string, role: string): Promise<string> {
    const client = await this.clientService.findByClientId(clientId);
    if (!client) throw new UnauthorizedException('Client ID not found');

    // Revoke semua token aktif milik client ini
    await this.repo.update(
        { client, revoked: false },
        { revoked: true }
    );
    const token = randomUUID();
    
    let expiresInDays = parseInt(this.configService.get('REFRESH_TOKEN_EXPIRY_DAYS') || '7', 10);
    if (isNaN(expiresInDays)) expiresInDays = 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.repo.save({ token, client, role, expiresAt });
    return token;
    }

  async validate(token: string): Promise<{ client_id: string; role: string }> {
    const record = await this.repo.findOne({
      where: { token, revoked: false, expiresAt: MoreThan(new Date()) },
      relations: ['client'],
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      client_id: record.client.client_id,
      role: record.role,
    };
  }

  async revoke(token: string): Promise<void> {
    await this.repo.update({ token }, { revoked: true });
  }

  async revokeAllForClient(clientId: string): Promise<void> {
    const client = await this.clientService.findByClientId(clientId);
    if (client) {
      await this.repo.update({ client, revoked: false }, { revoked: true });
    }
  }
}