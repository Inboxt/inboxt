import { Resolver, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';

import { UpdateAccountInput } from './dto/update-account.input';
import { UserService } from './user.service';
import { User } from './user.model';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Void } from '../../models/void.model';
import { VOID_RESPONSE } from '../../constants/void';
import { DeleteAccountInput } from './dto/delete-account.input';
import { NonDemo } from '../../decorators/account.decorator';

@Resolver(() => User)
export class UserResolver {
	constructor(private userService: UserService) {}

	@NonDemo()
	@Mutation(() => User)
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
