import { TypeProduct } from "../enums/type-product.enum";

export class EnduserBase{
  clientId: string;
  id_enduser: number;
  product: TypeProduct
  products: Record<
    TypeProduct,
    {
      domain: string;
      secret: string;
    }
  >;
};