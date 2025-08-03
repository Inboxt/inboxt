import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { Prisma } from '../../../../../../prisma/client';
import { PrismaService } from '../../../../../services/prisma.service';
import { AppException } from '../../../../../utils/app-exception';
import { NewsletterService } from '../newsletter.service';
import { InboundEmailAddressService } from '../../../../inbound-email-address/inbound-email-address.service';

@Injectable()
export class NewsletterSubscriptionService {
	constructor(
		private prisma: PrismaService,
		private inboundEmailAddressService: InboundEmailAddressService,
		private newsletterService: NewsletterService,
	) {}

	async get(userId: string, query: Prisma.newsletter_subscriptionFindFirstArgs) {
		return this.prisma.newsletter_subscription.findFirst({
			...query,
			where: {
				...query.where,
				inbound_email_address: {
					userId,
				},
			},
		});
	}

	async getMany(userId: string, query: Prisma.newsletter_subscriptionFindManyArgs) {
		return this.prisma.newsletter_subscription.findMany({
			...query,
			where: {
				...query.where,
				inbound_email_address: { userId },
			},
		});
	}

	async create(
		userId: string,
		inboundEmailAddressId: string,
		data: Omit<
			Prisma.newsletter_subscriptionCreateInput,
			'inbound_email_address' | 'newsletter' | 'newsletterId' | 'inboundEmailAddressId'
		>,
	) {
		/*----------  Validation  ----------*/
		const inboundEmailAddress = await this.inboundEmailAddressService.get(userId, {
			where: {
				id: inboundEmailAddressId,
			},
		});

		if (!inboundEmailAddress) {
			throw new AppException('Email address not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.newsletter_subscription.create({
			data: {
				...data,
				inboundEmailAddressId,
			},
		});
	}

	async update(
		userId: string,
		id: string,
		data: Omit<Prisma.newsletter_subscriptionUpdateInput, 'id'>,
	) {
		/*----------  Validation  ----------*/
		const subscription = await this.get(userId, { where: { id } });
		if (!subscription) {
			throw new AppException('Subscription not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.newsletter_subscription.update({
			where: { id },
			data,
		});
	}

	async updateStatus(
		userId: string,
		id: string,
		status: Prisma.newsletter_subscriptionUpdateInput['status'],
	) {
		/*----------  Validation  ----------*/
		const subscription = await this.get(userId, { where: { id } });
		if (!subscription) {
			throw new AppException('Subscription not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.newsletter_subscription.update({
			where: { id },
			data: {
				status,
				unsubscribeAttemptedAt: status === 'UNSUBSCRIBED' ? dayjs().toDate() : null,
			},
		});
	}

	async link(userId: string, subscriptionId: string, newsletterId: string) {
		/*----------  Validation  ----------*/
		const newsletter = await this.newsletterService.get(userId, {
			where: { savedItemId: newsletterId },
		});

		if (!newsletter) {
			throw new AppException('Newsletter not found', HttpStatus.NOT_FOUND);
		}

		const subscription = await this.get(userId, { where: { id: subscriptionId } });
		if (!subscription) {
			throw new AppException('Subscription not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.newsletter.update({
			where: { savedItemId: newsletterId },
			data: { subscriptionId },
		});
	}
}
