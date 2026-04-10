import { EnduserBase } from "src/commons/types/enduser.type";

export class AuthBase extends EnduserBase {
  key_device?: string;
  id_device: string;
  deviceId: string;
};

export class AuthDevice extends AuthBase {
  blackListSend: string[];
  blackListGet: string[];
}

export type AuthBlacklist = {
  blackListSend: string[];
  blackListGet: string[];
};

export class DeviceInfo {
  id: number;
  deviceId: string;
  product: string
}

export type DevicePrincipalAuth = Omit<AuthDevice, 'id_enduser'>;
