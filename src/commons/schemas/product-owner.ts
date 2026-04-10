import { TypeProduct } from "../enums/type-product.enum";

export class ProductOwner {
  constructor(products){
    this.products = products
  }

  protected products: Record<
    TypeProduct,
    {
      domain: string;
      secret: string;
    }
  >;

  getProduct(product: string) {
    const p = this.products[product];
    if (!p) {
      throw new Error(`PRODUCT_NOT_ALLOWED: ${product}`);
    }
    return p;
  }
}
