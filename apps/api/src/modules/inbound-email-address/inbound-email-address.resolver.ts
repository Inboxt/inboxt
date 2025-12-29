import { Resolver, Args, Mutation, Query, ResolveField, Parent } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { VerifiedOnly } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';
import { Void } from '~common/models/void.model';
import { NewsletterSubscription } from '~modules/saved-item/entities/newsletter/newsletter-subscription/newsletter-subscription.model';

import { DeleteInboundEmailAddressInput } from './dto/delete-inbound-email-address.input';
import { InboundEmailAddress } from './inbound-email-address.model';
import { InboundEmailAddressService } from './inbound-email-address.service';

@Resolver(() => InboundEmailAddress)
export class InboundEmailAddressResolver {
	constructor(private readonly inboundEmailAddressService: InboundEmailAddressService) {}

	@ApiTokenAllowed()
	@Query(() => [InboundEmailAddress], { nullable: true })
	async inboundEmailAddresses(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		return this.inboundEmailAddressService.getMany(activeUser.id, {
			where: {
				deletedAt: null,
			},
		});
	}

	@VerifiedOnly()
	@Mutation(() => InboundEmailAddress)
	async createInboundEmailAddress(@ActiveUserMeta() activeUser: ActiveUserMetaType) {
		return this.inboundEmailAddressService.create(activeUser.id);
	}

	@Mutation(() => Void)
	async deleteInboundEmailAddress(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: DeleteInboundEmailAddressInput,
	) {
		await this.inboundEmailAddressService.delete(activeUser.id, data.id);
		return VOID_RESPONSE;
	}

	@ResolveField('subscriptions', () => [NewsletterSubscription], { nullable: true })
	async subscriptions(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() inboundEmailAddress: InboundEmailAddress,
	) {
		if (!inboundEmailAddress) {
			return null;
		}

		return this.inboundEmailAddressService.getSubscriptions(
			activeUser.id,
			inboundEmailAddress.id,
			{},
		);
	}
}
