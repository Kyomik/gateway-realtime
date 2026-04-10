import { TypeProduct } from "../enums/type-product.enum";
import { ProductOwner } from "./product-owner";


export abstract class EndUser extends ProductOwner {
  public clientId: string
  
  constructor(
    clientId: string,
    protected products: Record<TypeProduct, { domain: string; secret: string }>
  ) {
    super(products);
    this.clientId = clientId
  }
}