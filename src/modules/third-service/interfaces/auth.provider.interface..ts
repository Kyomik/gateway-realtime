export interface IAuthProvider {
  verifyIdToken(token: string): Promise<{ uid: string; role?: string; [key: string]: any }>;
}