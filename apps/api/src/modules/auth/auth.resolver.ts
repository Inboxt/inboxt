import { Resolver, Args, Mutation, Context } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { Public } from 'src/decorators/public.decorator';
import { SignInInput } from './dto/sign-in.input';
import { GqlContext } from '../../types/graphql-context';
import { VerifyEmailInput } from './dto/verify-email.input';
import { CreateAccountInput } from '../user/dto/create-account.input';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { RequestPasswordRecoveryInput } from './dto/request-password-recovery.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { NonDemo } from '../../decorators/account.decorator';

@Resolver()
export class AuthResolver {
	constructor(private authService: AuthService) {}

	@Public()
	@Mutation(() => Void)
	async signIn(
		@Args('data') { emailAddress, password }: SignInInput,
		@Context() context: GqlContext,
	) {
		await this.authService.signIn(emailAddress.toLowerCase(), password, context.req);

		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async signOut(@Context() context: GqlContext) {
		this.authService.signOut(context);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	async createAccount(@Args('data') data: CreateAccountInput, @Context() context: GqlContext) {
		await this.authService.createUser(data, context.req);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	async createDemoAccount(@Context() context: GqlContext) {
		await this.authService.createDemo(context.req);
		return VOID_RESPONSE;
	}

	@NonDemo()
	@Mutation(() => Void)
	async verifyEmail(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: VerifyEmailInput,
	) {
		await this.authService.verifyEmail(activeUser.id, data);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	async requestPasswordRecovery(@Args('data') data: RequestPasswordRecoveryInput) {
		await this.authService.requestPasswordRecovery(data);
		return VOID_RESPONSE;
	}

	@Public()
	@Mutation(() => Void)
	async resetPassword(@Args('data') data: ResetPasswordInput) {
		await this.authService.resetPassword(data);
		return VOID_RESPONSE;
	}
}
