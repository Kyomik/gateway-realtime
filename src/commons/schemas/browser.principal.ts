import { EndUser } from "./enduser.principal";
import { TypeProduct } from "../enums/type-product.enum";
import { BrowserPrincpalAuth } from "src/modules/auth/types/auth-browser.type";

export class BrowserUser extends EndUser {
  public readonly role: string;
  public readonly whiteListSend: string[];
  public readonly whiteListGet: string[];
  public readonly role_product: TypeProduct;

  constructor(auth: BrowserPrincpalAuth) {
    super(auth.clientId, auth.products);
    this.role = auth.role;
    this.whiteListSend = auth.whiteListSend;
    this.whiteListGet = auth.whiteListGet;
    this.role_product = auth.product;
  }
}