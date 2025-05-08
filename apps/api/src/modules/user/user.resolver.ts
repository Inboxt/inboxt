import { Resolver, Args, Mutation } from '@nestjs/graphql';

import { UpdateAccountInput } from './dto/update-account.input';
import { UserService } from './user.service';
import { User } from './user.model';
import { ActiveUserMeta } from '../../decorators/active-user-meta.decorator';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';

@Resolver(() => User)
export class UserResolver {
	constructor(private userService: UserService) {}

	@Mutation(() => User)
	async updateAccount(
		@ActiveUserMeta() activeUser: ActiveUserMeta,
		@Args('data') data: UpdateAccountInput,
	) {
		return this.userService.update(activeUser.userId, data);
	}

	@Mutation(() => Void)
	async resendVerificationEmail(
		@ActiveUserMeta() activeUser: ActiveUserMeta,
	) {
		await this.userService.sendVerificationEmail(activeUser.userId);
		return VOID_RESPONSE;
	}
}
