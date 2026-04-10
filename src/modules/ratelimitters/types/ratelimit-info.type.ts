export interface RateLimitInfo {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}