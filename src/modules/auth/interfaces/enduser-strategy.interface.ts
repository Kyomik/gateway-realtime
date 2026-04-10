import { EnduserBase } from "src/commons/types/enduser.type";
import { TypeProduct } from "src/commons/enums/type-product.enum";

export interface IEnduserStrategy <T extends EnduserBase>{
  getIdsByTenantAndProduct(client: string, type: TypeProduct): Promise<number[]>;
  getAuth(clientId: string, role: string): Promise<T>
}