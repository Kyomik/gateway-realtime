import { Injectable } from '@nestjs/common';
import { IAuthStrategy } from '../interfaces/auth-strategy.interface';
import { DeviceUser } from 'src/commons/schemas/device.principal';
import { DeviceService } from '../services/device.service';
import { FormatHMAC } from '../types/token-auth.';
import * as crypto from 'crypto';
import { AppWsException } from 'src/commons/exceptions/ws-error.exception';
import { AuthResult } from 'src/modules/auth/types/auth-result.type';

@Injectable()
export class HmacAuthStrategy implements IAuthStrategy {
  constructor(private readonly deviceService: DeviceService) {}

  async validate(token: string): Promise<AuthResult> {
    let parsedToken: FormatHMAC 

    try {
      parsedToken = JSON.parse(token);
    } catch {
      throw new AppWsException(
        'INVALID_TOKEN_FORMAT',
        'Token must be a valid JSON HMAC payload',
      );
    }
    
    const { clientId, timestamp, signature, deviceId } = parsedToken;

    if (!clientId || !timestamp || !signature || !deviceId) {
      throw new AppWsException(
        'INVALID_TOKEN_FORMAT',
        'Missing HMAC fields',
      );
    }

    const diff = Math.abs(Date.now() - parseInt(timestamp));
    
    if (diff > 300000) {
      throw new AppWsException(
        'TOKEN_EXPIRED',
        'HMAC token expired',
      );
    }

    const device = await this.deviceService.getAuth(clientId, deviceId);
    
    if (!device) {
      throw new AppWsException(
        'UNAUTHENTICATED',
        'Unknown Device',
      );
    }

    const message = deviceId + timestamp + clientId;
    const expectedSignature = this.createHmac(device.key_device, message);
    const isValid = this.compareSignatures(signature, expectedSignature);

    if (!isValid) {
      throw new AppWsException(
        'INVALID_SIGNATURE',
        'Invalid HMAC signature',
      );
    }

    const authData = {
      product: device.product,
      id_device: device.id_device,
      clientId: device.clientId,
      products: device.products,
      deviceId: device.deviceId,
      blackListGet: device.blackListGet,
      blackListSend: device.blackListSend
    }

    return {
      auth: new DeviceUser(authData),
      id_enduser: device.id_enduser
    };
  }

  private createHmac(secret: string | undefined, message: string): string {
    if (!secret) {
      throw new AppWsException(
        'UNAUTHENTICATED',
        'Unknown Device',
      );
    }
    
    return crypto.createHmac(
      'sha256', 
      secret
    ).update(message).digest('hex');
  }

  private compareSignatures(sig1: string, sig2: string): boolean {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(sig1, 'hex'),
        Buffer.from(sig2, 'hex'),
      );
    } catch {
      return false;
    }
  }
}
