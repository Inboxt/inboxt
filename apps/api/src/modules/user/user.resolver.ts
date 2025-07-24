import { Resolver, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';

import { UpdateAccountInput } from './dto/update-account.input';
import { UserService } from './user.service';
import { User } from './user.model';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { DeleteAccountInput } from './dto/delete-account.input';

@Resolver(() => User)
export class UserResolver {
	constructor(private userService: UserService) {}

	@Mutation(() => User)
	async updateAccount(
		@ActiveUserMeta() user: ActiveUserMetaType,
		@Args('data') data: UpdateAccountInput,
	) {
		return this.userService.update(user.userId, data);
	}

	@Mutation(() => Void)
	async deleteAccount(
		@ActiveUserMeta() user: ActiveUserMetaType,
		@Args('data') data: DeleteAccountInput,
	) {
		await this.userService.delete(user.userId, data);
		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async resendVerificationEmail(@ActiveUserMeta() user: ActiveUserMetaType) {
		await this.userService.sendVerificationEmail(user.userId);
		return VOID_RESPONSE;
	}

	@ResolveField(() => Number)
	async labelsCount(@Parent() user: User): Promise<number> {
		return this.userService.countLabels(user.id);
	}
}
