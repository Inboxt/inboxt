import { SetMetadata } from '@nestjs/common';

export interface RateLimitBucket {
	points: number; // max allowed in window
	duration: number; // in seconds
}

export type AuthState = 'guest' | 'user';
export const RATE_LIMIT_META_KEY = 'rate-limit';

export type RateLimitOptions = Partial<Record<AuthState, Partial<RateLimitBucket>>>;
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_META_KEY, options);
