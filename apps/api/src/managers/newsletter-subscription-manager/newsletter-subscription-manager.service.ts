import { Injectable } from '@nestjs/common';

import { Prisma } from '@inboxt/prisma';

import { PrismaService } from '~modules/prisma/prisma.service';

@Injectable()
export class NewsletterSubscriptionManagerService {
	constructor(private readonly prisma: PrismaService) {}

	async getMany(
		inboundEmailAddressId: string,
		query: Prisma.newsletter_subscriptionFindManyArgs,
	) {
		return this.prisma.newsletter_subscription.findMany({
			...query,
			where: {
				...query.where,
				inboundEmailAddressId,
			},
		});
	}

	async deleteForInboundEmailAddress(inboundEmailAddressId: string) {
		const subscriptions = await this.getMany(inboundEmailAddressId, {});
		if (subscriptions.length) {
			await Promise.all(
				subscriptions.map((subscription) =>
					this.prisma.newsletter_subscription.delete({
						where: { id: subscription.id },
					}),
				),
			);
		}
	}
}
