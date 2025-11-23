import { ExecutionContext, Injectable, CanActivate, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { NON_DEMO_KEY, VERIFIED_ONLY_KEY } from '../decorators/account.decorator';
import { PrismaService } from '../services/prisma.service';
import { AppException } from '../utils/app-exception';

@Injectable()
export class AccountGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prismaService: PrismaService,
	) {}

	async canActivate(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context);
		const { user: partialUser } = ctx.getContext().req;

		if (!partialUser) {
			return true;
		}

		const user = await this.prismaService.user.findUnique({ where: { id: partialUser.id } });
		if (!user) {
			return true;
		}

		const requireNonDemo = this.reflector.getAllAndOverride<boolean>(NON_DEMO_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		const requireVerified = this.reflector.getAllAndOverride<boolean>(VERIFIED_ONLY_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (requireNonDemo && user.plan === 'DEMO') {
			throw new AppException(
				'This feature is not available in demo mode.',
				HttpStatus.FORBIDDEN,
			);
		}

		if (requireVerified) {
			if (user.plan === 'DEMO') {
				throw new AppException(
					'This feature is not available in demo mode.',
					HttpStatus.FORBIDDEN,
				);
			}

			if (!user.isEmailVerified) {
				throw new AppException(
					'Please verify your email to use this feature.',
					HttpStatus.FORBIDDEN,
				);
			}
		}

		return true;
	}
}
