import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Valkey from 'iovalkey';
import { RateLimiterValkey } from 'rate-limiter-flexible';

import { AuthState, RateLimitBucket } from '~common/decorators/rate-limit.decorator';
import { type Config } from '~config/index';

@Injectable()
export class RateLimitService implements OnModuleDestroy {
	private readonly valkeyClient: Valkey;

	private readonly buckets: Record<AuthState, RateLimitBucket> = {
		guest: { points: 30, duration: 60 }, // 30 requests / minute
		user: { points: 300, duration: 60 }, // 300 requests / minute
		api_token: { points: 600, duration: 60 }, // 600 requests / minute
	};

	private readonly limiters: Record<AuthState, RateLimiterValkey>;

	private readonly customLimiters = new Map<string, RateLimiterValkey>();

	constructor(private readonly configService: ConfigService<Config>) {
		const valkeyConfig = this.configService.getOrThrow('valkey', { infer: true });
		this.valkeyClient = new Valkey({
			host: valkeyConfig.connection.host,
			port: valkeyConfig.connection.port,
		});

		this.limiters = {
			guest: new RateLimiterValkey({
				storeClient: this.valkeyClient,
				keyPrefix: 'rl:guest',
				points: this.buckets.guest.points,
				duration: this.buckets.guest.duration,
			}),
			user: new RateLimiterValkey({
				storeClient: this.valkeyClient,
				keyPrefix: 'rl:user',
				points: this.buckets.user.points,
				duration: this.buckets.user.duration,
			}),
			api_token: new RateLimiterValkey({
				storeClient: this.valkeyClient,
				keyPrefix: 'rl:api_token',
				points: this.buckets.api_token.points,
				duration: this.buckets.api_token.duration,
			}),
		};
	}

	async consume(authState: AuthState, key: string) {
		const limiter = this.limiters[authState];
		return limiter.consume(key);
	}

	async consumeCustom(authState: AuthState, key: string, options: Partial<RateLimitBucket>) {
		const base = this.buckets[authState];
		const points = options.points ?? base.points;
		const duration = options.duration ?? base.duration;

		const customKey = `${authState}:${points}:${duration}`;
		let limiter = this.customLimiters.get(customKey);

		if (!limiter) {
			limiter = new RateLimiterValkey({
				storeClient: this.valkeyClient,
				keyPrefix: `rl:${authState}:custom:${points}:${duration}`,
				points,
				duration,
			});
			this.customLimiters.set(customKey, limiter);
		}

		return limiter.consume(key);
	}

	onModuleDestroy() {
		if (this.valkeyClient) {
			this.valkeyClient.disconnect();
		}
	}
}
