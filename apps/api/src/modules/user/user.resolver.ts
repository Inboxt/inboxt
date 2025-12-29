import { Resolver, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { NonDemo } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';
import { Void } from '~common/models/void.model';

import { DeleteAccountInput } from './dto/delete-account.input';
import { UpdateAccountInput } from './dto/update-account.input';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@NonDemo()
	@Mutation(() => User)
	@RateLimit({ user: { points: 30, duration: 60 * 60 } })
	async updateAccount(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateAccountInput,
	) {
		return this.userService.update(activeUser.id, data);
	}

	@NonDemo()
	@Mutation(() => Void)
	async deleteAccount(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteAccountInput,
	) {
		await this.userService.delete(activeUser.id, data);
		return VOID_RESPONSE;
	}

	@NonDemo()
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

	@ResolveField(() => String)
	async storageUsageBytes(@Parent() user: User): Promise<string> {
		const u = await this.userService.get({ where: { id: user.id } });
		const v: any = u?.storageUsageBytes ?? 0;
		return typeof v === 'bigint' ? v.toString() : String(v);
	}

	@ResolveField(() => String)
	async storageQuotaBytes(@Parent() user: User): Promise<string> {
		const u = await this.userService.get({ where: { id: user.id } });
		const v: any = u?.storageQuotaBytes ?? 0;
		return typeof v === 'bigint' ? v.toString() : String(v);
	}
}
