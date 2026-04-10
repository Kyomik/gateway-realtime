import { EndUser } from "./enduser.principal";
import { TypeProduct } from "../enums/type-product.enum";
import { DevicePrincipalAuth } from "src/modules/auth/types/auth-device.type";

export class DeviceUser extends EndUser {
  public readonly deviceId: string;
  public readonly blacklistSend: string[];
  public readonly blacklistGet: string[];
  public readonly id_device: string;
  public readonly device_product: TypeProduct;

  constructor(auth: DevicePrincipalAuth) {
    super(auth.clientId, auth.products);
    
    this.deviceId = auth.deviceId;
    this.blacklistSend = auth.blackListSend;
    this.blacklistGet = auth.blackListGet;
    this.id_device = auth.id_device;
    this.device_product = auth.product;
  }
}
