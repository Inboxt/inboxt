import { Resolver, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';
import { Void } from '~common/models/void.model';
import { UserStats } from '~modules/user-stats/user-stats.model';
import { UserStatsService } from '~modules/user-stats/user-stats.service';

import { DeleteAccountInput } from './dto/delete-account.input';
import { UpdateAccountInput } from './dto/update-account.input';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
	constructor(
		private readonly userService: UserService,
		private readonly userStatsService: UserStatsService,
	) {}

	@Mutation(() => User)
	@RateLimit({ user: { points: 30, duration: 60 * 60 } })
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

	@ResolveField(() => UserStats)
	async stats(@Parent() user: User) {
		return this.userStatsService.getStats(user.id);
	}
}
