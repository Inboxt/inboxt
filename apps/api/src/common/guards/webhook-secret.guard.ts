import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

import { Config } from '~config/index';
import { RateLimitService } from '~modules/rate-limit/rate-limit.service';

@Injectable()
export class WebhookSecretGuard implements CanActivate {
	private readonly logger = new Logger(WebhookSecretGuard.name);

	constructor(
		private readonly configService: ConfigService<Config>,
		private readonly rateLimitService: RateLimitService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const webhookSecret = this.configService.get('security.webhookSecret', { infer: true });
		const request = context.switchToHttp().getRequest<Request>();

		// If no secret is configured, the request is only allowed if it has been pre-authenticated (e.g., by a reverse proxy)
		// We can't explicitly check for proxy auth here without knowing the setup,
		// but we allow it to pass if NO secret is configured in the app, assuming the user knows what they are doing.
		if (!webhookSecret) {
			return await this.runReplayProtection(request);
		}

		const webhookSecretHeader = this.configService.get('security.webhookSecretHeader', {
			infer: true,
		});

		const headerSecret =
			request.headers[webhookSecretHeader?.toLowerCase() ?? 'x-webhook-secret'];

		if (typeof headerSecret === 'string' && this.safeCompare(headerSecret, webhookSecret)) {
			return await this.runReplayProtection(request);
		}

		const querySecret = request.query.token;
		if (typeof querySecret === 'string' && this.safeCompare(querySecret, webhookSecret)) {
			return await this.runReplayProtection(request);
		}

		return false;
	}

	private async runReplayProtection(request: Request): Promise<boolean> {
		const messageId = this.extractMessageId(request.body);
		if (!messageId) {
			return true;
		}

		try {
			await this.rateLimitService.consumeCustom('guest', `webhook:replay:${messageId}`, {
				points: 1,
				duration: 600,
			});
			return true;
		} catch (_error) {
			this.logger.warn(`Replay detected or rate limit hit for messageId: ${messageId}`);
			return false;
		}
	}

	private extractMessageId(payload: any): string | null {
		if (!payload) {
			return null;
		}

		return (
			payload.messageId ||
			payload.message_id ||
			payload.MessageID ||
			payload.MessageId ||
			payload.items?.[0]?.MessageId ||
			payload.msys?.relay_message?.content?.['Message-ID'] ||
			payload.eventId ||
			payload._id ||
			null
		);
	}

	private safeCompare(a: string, b: string): boolean {
		if (!a || !b) {
			return false;
		}

		const aBuf = Buffer.from(a);
		const bBuf = Buffer.from(b);

		if (aBuf.length !== bBuf.length) {
			return false;
		}

		return timingSafeEqual(aBuf, bBuf);
	}
}
