import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

import { RateLimitService } from '../services/rate-limit.service';
import {
	AuthState,
	RATE_LIMIT_META_KEY,
	RateLimitOptions,
} from '../decorators/rate-limit.decorator';

@Injectable()
export class GqlRateLimitGuard implements CanActivate {
	constructor(
		private readonly rateLimitService: RateLimitService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const contextType = context.getType<'graphql' | 'http'>();

		let req: any;
		let res: any;
		if (contextType === 'graphql') {
			const gqlCtx = GqlExecutionContext.create(context);
			const ctx = gqlCtx.getContext();
			req = ctx.req;
			res = ctx.res;
		} else if (contextType === 'http') {
			const httpCtx = context.switchToHttp();
			req = httpCtx.getRequest();
			res = httpCtx.getResponse();
		}

		const { authState, key } = this.getAuthStateAndKey(req);
		const meta = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
			RATE_LIMIT_META_KEY,
			[context.getHandler(), context.getClass()],
		);

		try {
			if (meta) {
				const perState = meta[authState] ?? {};
				await this.rateLimitService.consumeCustom(authState, key, perState);
			} else {
				await this.rateLimitService.consume(authState, key);
			}

			return true;
		} catch (error: any) {
			// If this is a rate-limiter-flexible response, it should contain msBeforeNext, remainingPoints, etc.
			const rateLimiterRes = error;

			if (rateLimiterRes && res) {
				const headers = {
					'Retry-After': Math.ceil(rateLimiterRes.msBeforeNext / 1000),
					'X-RateLimit-Limit': String(
						meta?.[authState]?.points ?? rateLimiterRes.points ?? '',
					),
					'X-RateLimit-Remaining': String(rateLimiterRes.remainingPoints ?? 0),
					'X-RateLimit-Reset': Math.ceil(
						(Date.now() + rateLimiterRes.msBeforeNext) / 1000,
					),
				};

				Object.entries(headers).forEach(([key, value]) => {
					if (value !== '' && value !== undefined && value !== null) {
						res.setHeader(key, value);
					}
				});
			}

			throw new HttpException(
				{
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					message: 'Too many requests - our ducks can only paddle so fast!',
					error: 'Too Many Requests',
				},
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}
	}

	private getAuthStateAndKey(req: any): { authState: AuthState; key: string } {
		// Authenticated user
		if (req?.user?.id) {
			return {
				authState: 'user',
				key: `user:${req.user.id}`,
			};
		}

		// Fallback: guest by IP
		const ip =
			req?.ip ||
			req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
			req?.connection?.remoteAddress ||
			'unknown';

		return {
			authState: 'guest',
			key: `guest:${ip}`,
		};
	}
}
