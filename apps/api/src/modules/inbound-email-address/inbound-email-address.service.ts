import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import dayjs from 'dayjs';

import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { Config } from '~config/index';
import { NewsletterSubscriptionManagerService } from '~managers/newsletter-subscription-manager/newsletter-subscription-manager.service';
import { PrismaService } from '~modules/prisma/prisma.service';

@Injectable()
export class InboundEmailAddressService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly newsletterSubscriptionManagerService: NewsletterSubscriptionManagerService,
		private readonly configService: ConfigService<Config>,
	) {}

	private generateSlug() {
		return randomBytes(16).toString('hex');
	}

	async get(userId: string, query: Prisma.inbound_email_addressFindFirstArgs) {
		return this.prisma.inbound_email_address.findFirst({
			...query,
			where: {
				...query.where,
				userId,
			},
		});
	}

	async getMany(userId: string, query: Prisma.inbound_email_addressFindManyArgs) {
		return this.prisma.inbound_email_address.findMany({
			...query,
			where: {
				...query.where,
				userId,
			},
		});
	}

	async getSubscriptions(
		userId: string,
		inboundEmailAddressId: string,
		query: Prisma.newsletter_subscriptionFindManyArgs,
	) {
		const inboundEmailAddress = await this.get(userId, {
			where: { id: inboundEmailAddressId },
		});

		if (!inboundEmailAddress) {
			throw new AppException("Email doesn't exist", HttpStatus.NOT_FOUND);
		}

		return this.newsletterSubscriptionManagerService.getMany(inboundEmailAddressId, query);
	}

	async verify(emailAddress: string) {
		return this.prisma.inbound_email_address.findFirst({
			where: {
				fullAddress: emailAddress,
				deletedAt: null,
			},
		});
	}

	async create(userId: string) {
		const localPart = this.generateSlug();
		const domain = this.configService.get('inboundEmailAddressDomain', { infer: true });

		if (!domain) {
			throw new AppException(
				'Inbound email addresses are not configured on this instance',
				HttpStatus.SERVICE_UNAVAILABLE,
			);
		}

		return this.prisma.inbound_email_address.create({
			data: {
				userId,
				localPart,
				fullAddress: `${localPart}@${domain}`,
			},
		});
	}

	async delete(userId: string, id: string) {
		const inboundEmailAddress = await this.get(userId, { where: { id } });
		if (!inboundEmailAddress || inboundEmailAddress?.deletedAt) {
			throw new AppException("Email doesn't exist", HttpStatus.NOT_FOUND);
		}

		await this.newsletterSubscriptionManagerService.deleteForInboundEmailAddress(id);
		return this.prisma.inbound_email_address.update({
			where: { id },
			data: {
				deletedAt: dayjs().toDate(),
			},
		});
	}
}
