import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { randomBytes } from 'crypto';

import { Prisma } from '../../../prisma/client';

import { PrismaService } from '../../services/prisma.service';
import { AppException } from '../../utils/app-exception';
import { NewsletterSubscriptionManagerService } from '../../managers/newsletter-subscription-manager/newsletter-subscription-manager.service';

@Injectable()
export class InboundEmailAddressService {
	constructor(
		private readonly prismaService: PrismaService,
		private newsletterSubscriptionManagerService: NewsletterSubscriptionManagerService,
	) {}

	private generateSlug(): string {
		const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
		const getRandomChars = (length: number) => {
			const bytes = randomBytes(length);
			return Array.from(bytes, (b) => charset[b % charset.length]).join('');
		};

		const part1 = getRandomChars(10);
		const part2 = getRandomChars(9);
		return `${part1}_${part2}`;
	}

	async get(userId: string, query: Prisma.inbound_email_addressFindFirstArgs) {
		return this.prismaService.inbound_email_address.findFirst({
			...query,
			where: {
				...query.where,
				userId,
			},
		});
	}

	async getMany(userId: string, query: Prisma.inbound_email_addressFindManyArgs) {
		return this.prismaService.inbound_email_address.findMany({
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
		/*----------  Validation  ----------*/
		const inboundEmailAddress = await this.get(userId, {
			where: { id: inboundEmailAddressId },
		});

		if (!inboundEmailAddress) {
			throw new AppException("Email doesn't exist", HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.newsletterSubscriptionManagerService.getMany(inboundEmailAddressId, query);
	}

	async verify(emailAddress: string) {
		return this.prismaService.inbound_email_address.findFirst({
			where: {
				fullAddress: emailAddress,
				deletedAt: null,
			},
		});
	}

	async create(userId: string) {
		/*----------  Validation  ----------*/
		const existingInboundEmailAddresses = await this.getMany(userId, {
			where: { deletedAt: null },
		});

		if (existingInboundEmailAddresses.length >= 2) {
			throw new AppException(
				'You have reached the maximum number of inbox newsletter emails',
				HttpStatus.BAD_REQUEST,
			);
		}

		/*----------  Processing  ----------*/
		const localPart = this.generateSlug();
		return this.prismaService.inbound_email_address.create({
			data: {
				userId,
				localPart,
				fullAddress: `${localPart}@${process.env.INBOUND_EMAIL_ADDRESS_DOMAIN}`,
			},
		});
	}

	async delete(userId: string, id: string) {
		/*----------  Validation  ----------*/
		const inboundEmailAddress = await this.get(userId, { where: { id } });
		if (!inboundEmailAddress || inboundEmailAddress?.deletedAt) {
			throw new AppException("Email doesn't exist", HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		await this.newsletterSubscriptionManagerService.deleteForInboundEmailAddress(id);
		return this.prismaService.inbound_email_address.update({
			where: { id },
			data: {
				deletedAt: dayjs().toDate(),
			},
		});
	}
}
