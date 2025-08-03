import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../prisma/client';

import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class NewsletterSubscriptionManagerService {
	constructor(private readonly prismaService: PrismaService) {}

	async getMany(
		inboundEmailAddressId: string,
		query: Prisma.newsletter_subscriptionFindManyArgs,
	) {
		return this.prismaService.newsletter_subscription.findMany({
			...query,
			where: {
				...query.where,
				inboundEmailAddressId,
			},
		});
	}

	/**
	 * Deletes subscriptions for a given inbound email address.
	 * Assumes inboundEmailAddressId belongs to an authenticated user.
	 */
	async deleteForInboundEmailAddress(inboundEmailAddressId: string) {
		const subscriptions = await this.getMany(inboundEmailAddressId, {});
		if (subscriptions.length) {
			await Promise.all(
				subscriptions.map((subscription) =>
					this.prismaService.newsletter_subscription.delete({
						where: { id: subscription.id },
					}),
				),
			);
		}
	}
}
