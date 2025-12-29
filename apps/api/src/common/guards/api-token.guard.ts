import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ApiTokenService } from '~modules/api-token/api-token.service';

import { API_TOKEN_ALLOWED_KEY } from '../decorators/api-token.decorator';

@Injectable()
export class ApiTokenGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly apiTokenService: ApiTokenService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const gqlCtx = GqlExecutionContext.create(context);
		const ctx = gqlCtx.getContext();
		const req = ctx.req;

		const authHeader: string | undefined = req.headers?.authorization;
		if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
			// No API token → let other guards (JWT, public, etc.) handle it
			return true;
		}

		const token = authHeader.slice('bearer '.length).trim();
		if (!token) {
			throw new UnauthorizedException('Invalid API token');
		}

		// Check if this resolver/class is allowed to be used with API tokens
		const apiTokenAllowed = this.reflector.getAllAndOverride<boolean>(API_TOKEN_ALLOWED_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!apiTokenAllowed) {
			// An API token is being used against a non-API route
			throw new ForbiddenException('API tokens are not allowed for this operation');
		}

		// Validate token and load user
		const { user, apiToken } = await this.apiTokenService.validateToken(token);
		if (!user || !apiToken) {
			throw new UnauthorizedException('Invalid or expired API token');
		}

		// Attach to request so downstream guards/decorators see the same shape as normal auth
		req.user = { id: user.id };
		req.apiToken = apiToken;

		return true;
	}
}
