import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiterValkey } from 'rate-limiter-flexible';
import Valkey from 'iovalkey';
import { ValkeyConfig } from '../config/config.interface';
import { AuthState, RateLimitBucket } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitService implements OnModuleDestroy {
	private valkeyClient: Valkey;

	private readonly buckets: Record<AuthState, RateLimitBucket> = {
		guest: { points: 30, duration: 60 }, // 30 requests / minute
		user: { points: 300, duration: 60 }, // 300 requests / minute
	};

	private readonly limiters: Record<AuthState, RateLimiterValkey>;

	constructor(private readonly configService: ConfigService) {
		const valkeyConfig = this.configService.get<ValkeyConfig>('valkey');

		this.valkeyClient = new Valkey({
			host: valkeyConfig?.connection.host,
			port: valkeyConfig?.connection.port,
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
		};
	}

	async consume(authState: AuthState, key: string) {
		const limiter = this.limiters[authState];
		return limiter.consume(key);
	}

	async consumeCustom(authState: AuthState, key: string, options: Partial<RateLimitBucket>) {
		const base = this.buckets[authState];

		const limiter = new RateLimiterValkey({
			storeClient: this.valkeyClient,
			keyPrefix: `rl:${authState}:custom`,
			points: options.points ?? base.points,
			duration: options.duration ?? base.duration,
		});

		return limiter.consume(key);
	}

	onModuleDestroy() {
		if (this.valkeyClient) {
			this.valkeyClient.disconnect();
		}
	}
}
