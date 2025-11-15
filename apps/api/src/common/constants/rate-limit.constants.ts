import { RateLimitOptions } from '../../decorators/rate-limit.decorator';

export const HOURLY_RATE_LIMIT: RateLimitOptions = {
	guest: { points: 10, duration: 60 * 60 },
	user: { points: 10, duration: 60 * 60 },
};
