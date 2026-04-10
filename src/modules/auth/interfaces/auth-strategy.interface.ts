import { AuthResult } from "../types/auth-result.type";

export interface IAuthStrategy {
  validate(token: string, clientId?: string): Promise<AuthResult>;
}