import { IEmailProvider } from '../interfaces/email.provider.interface';
import { IAuthProvider } from '../interfaces/auth.provider.interface.';

export type ProviderFactoryLabelType = 'email' | 'auth';
export type ProviderFactoryType = IEmailProvider | IAuthProvider;

export type CProviderFactory = {
  instance: ProviderFactoryType;
  timer: NodeJS.Timeout;
}
