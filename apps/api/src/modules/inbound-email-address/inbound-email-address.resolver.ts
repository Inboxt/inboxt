import { Resolver, Args, Mutation, Query, ResolveField, Parent } from '@nestjs/graphql';

import { InboundEmailAddressService } from './inbound-email-address.service';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Void } from '../../models/void.model';
import { DeleteInboundEmailAddressInput } from './dto/delete-inbound-email-address.input';
import { VOID_RESPONSE } from '../../constants/void';
import { InboundEmailAddress } from './inbound-email-address.model';

import { NewsletterSubscription } from '../saved-item/entities/newsletter/newsletter-subscription/newsletter-subscription.model';
import { VerifiedOnly } from '../../decorators/account.decorator';

@Resolver(() => InboundEmailAddress)
export class InboundEmailAddressResolver {
	constructor(private inboundEmailAddressService: InboundEmailAddressService) {}

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
		@Parent() inboundEmailAddress,
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
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
