import { ExecutionContext, Injectable, CanActivate, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PrismaService } from '~modules/prisma/prisma.service';

import { VERIFIED_ONLY_KEY } from '../decorators/account.decorator';
import { AppException } from '../utils/app-exception';

@Injectable()
export class AccountGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prisma: PrismaService,
	) {}

	async canActivate(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context);
		const { user: partialUser } = ctx.getContext().req;

		if (!partialUser) {
			return true;
		}

		const user = await this.prisma.user.findUnique({ where: { id: partialUser.id } });
		if (!user) {
			return true;
		}

		const requireVerified = this.reflector.getAllAndOverride<boolean>(VERIFIED_ONLY_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (requireVerified && !user.isEmailVerified) {
			throw new AppException(
				'Please verify your email to use this feature.',
				HttpStatus.FORBIDDEN,
			);
		}

		return true;
	}
}
