import { EnduserBase } from "src/commons/types/enduser.type";

export class AuthBase extends EnduserBase{
  role: string;
  roleId: string;
};

export class AuthBrowser extends AuthBase{
  whiteListSend: string[];
  whiteListGet: string[];
}

export type AuthWhitelist = {
  whiteListSend: string[];
  whiteListGet: string[];
};

export type BrowserPrincpalAuth = Omit<AuthBrowser, 'id_enduser'>;
