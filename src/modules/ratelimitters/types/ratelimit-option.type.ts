export interface RateLimitOptions {
  windowMs: number;      // jangka waktu dalam milidetik
  maxAttempts: number;   // maksimal percobaan dalam window
  blockDuration?: number; // opsional, lama blokir (default = windowMs)
}