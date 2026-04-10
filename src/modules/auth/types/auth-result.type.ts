import { EndUser } from '../../../commons/schemas/enduser.principal'

export interface AuthResult {
  auth: EndUser;
  id_enduser: number;
}