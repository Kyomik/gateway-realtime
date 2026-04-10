import { RateLimitInfo } from "../types/ratelimit-info.type";

export interface IStorageRateLimit {
  /**
   * Mendapatkan info rate limit untuk suatu key.
   * @throws tidak melempar error, mengembalikan undefined jika key tidak ada.
   */
  get(key: string): Promise<RateLimitInfo | undefined>;

  /**
   * Menyimpan info rate limit.
   */
  set(key: string, info: RateLimitInfo): Promise<void>;

  /**
   * Menghapus info untuk suatu key (misal setelah autentikasi berhasil).
   */
  delete(key: string): Promise<void>;

  /**
   * Operasi atomik: menambah hitungan percobaan.
   * Jika key belum ada, buat baru dengan count=1.
   * Jika sudah melebihi batas, set blockedUntil.
   * Mengembalikan info terkini.
   */
  increment(
    key: string,
    windowMs: number,
    maxAttempts: number,
  ): Promise<{
    currentCount: number;
    blocked: boolean;
    blockedUntil?: number;
  }>;
}