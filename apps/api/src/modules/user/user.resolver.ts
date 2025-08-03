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
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateAccountInput,
	) {
		return this.userService.update(activeUser.id, data);
	}

	@Mutation(() => Void)
	async deleteAccount(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteAccountInput,
	) {
		await this.userService.delete(activeUser.id, data);
		return VOID_RESPONSE;
	}

	@Mutation(() => Void)
	async resendVerificationEmail(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		await this.userService.sendVerificationEmail(activeUser.id);
		return VOID_RESPONSE;
	}

	@ResolveField(() => Number)
	async labelsCount(@Parent() user: User): Promise<number> {
		return this.userService.countLabels(user.id);
	}

	@ResolveField(() => Number)
	async inboundEmailAddressesCount(@Parent() user: User): Promise<number> {
		return this.userService.countInboundEmailAddresses(user.id);
	}
}
