import { Resolver, Args, Mutation, Context } from '@nestjs/graphql';

import { HOURLY_RATE_LIMIT } from '~common/constants/rate-limit.constants';
import { VOID_RESPONSE } from '~common/constants/void';
import { NonDemo } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { Public } from '~common/decorators/public.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';
import { Void } from '~common/models/void.model';
import { GqlContext } from '~common/types/graphql-context';
import { CreateAccountInput } from '~modules/user/dto/create-account.input';

import { AuthService } from './auth.service';
import { RequestPasswordRecoveryInput } from './dto/request-password-recovery.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { SignInInput } from './dto/sign-in.input';
import { VerifyEmailInput } from './dto/verify-email.input';

@Resolver()
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Mutation(() => Void)
	@RateLimit(HOURLY_RATE_LIMIT)
	async signIn(
		@Args('data') { emailAddress, password }: SignInInput,
		@Context() context: GqlContext,
	) {
		await this.authService.signIn(emailAddress.toLowerCase(), password, context.req);

		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	signOut(@Context() context: GqlContext) {
		this.authService.signOut(context);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	@RateLimit(HOURLY_RATE_LIMIT)
	async createAccount(@Args('data') data: CreateAccountInput, @Context() context: GqlContext) {
		await this.authService.createUser(data, context.req);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	@RateLimit(HOURLY_RATE_LIMIT)
	async createDemoAccount(@Context() context: GqlContext) {
		await this.authService.createDemo(context.req);
		return VOID_RESPONSE;
	}

	@NonDemo()
	@Mutation(() => Void)
	@RateLimit(HOURLY_RATE_LIMIT)
	async verifyEmail(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: VerifyEmailInput,
	) {
		await this.authService.verifyEmail(activeUser.id, data);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	@RateLimit(HOURLY_RATE_LIMIT)
	async requestPasswordRecovery(@Args('data') data: RequestPasswordRecoveryInput) {
		await this.authService.requestPasswordRecovery(data);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	@RateLimit(HOURLY_RATE_LIMIT)
	async resetPassword(@Args('data') data: ResetPasswordInput) {
		await this.authService.resetPassword(data);
		return VOID_RESPONSE;
	}
}
