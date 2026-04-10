import { Injectable } from '@nestjs/common';
import { IAuthStrategy } from '../interfaces/auth-strategy.interface';
import { DeviceUser } from 'src/commons/schemas/device.principal';
import { DeviceService } from '../services/device.service';
import { FormatHMAC } from '../types/token-auth.';
import { AppWsException } from 'src/commons/exceptions/ws-error.exception';
import { AuthResult } from 'src/modules/auth/types/auth-result.type';

@Injectable()
export class MockAuthStrategy implements IAuthStrategy {
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

    const { clientId, deviceId } = parsedToken;

    if (!clientId || !deviceId) {
      throw new AppWsException(
        'INVALID_TOKEN_FORMAT',
        'Missing HMAC fields',
      );
    }

    const device = await this.deviceService.getAuth(clientId, deviceId);
    
    const authData =  {
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
}
