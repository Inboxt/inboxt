import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { hash } from 'argon2';

import { updateAccountSchema, deleteAccountSchema } from '@inbox-reader/schemas';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import { CreateAccountInput } from './dto/create-account.input';
import { UpdateAccountInput } from './dto/update-account.input';
import { AppException } from '../../utils/app-exception';
import { generateCode } from '../../utils/generate-code';
import { MailService } from '../mail/mail.service';
import { DeleteAccountInput } from './dto/delete-account.input';
import { InboundEmailAddressService } from '../inbound-email-address/inbound-email-address.service';
import { NewsletterSubscriptionManagerService } from '../../managers/newsletter-subscription-manager/newsletter-subscription-manager.service';

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private mailService: MailService,
		private inboundEmailAddressService: InboundEmailAddressService,
		private newsletterSubscriptionManagerService: NewsletterSubscriptionManagerService,
	) {}

	async get(query: Prisma.userFindFirstArgs) {
		return this.prisma.user.findFirst(query);
	}

	async getMany(query: Prisma.userFindManyArgs) {
		return this.prisma.user.findMany(query);
	}

	async countLabels(userId: string) {
		return this.prisma.label.count({
			where: { userId },
		});
	}

	async countInboundEmailAddresses(userId: string) {
		return this.prisma.inbound_email_address.count({
			where: { userId },
		});
	}

	async initiateEmailVerification(id: string) {
		const code = generateCode();
		const hashedCode = await hash(code);

		await this.prisma.user.update({
			where: { id },
			data: {
				emailVerifyCode: hashedCode,
				emailVerifyExpiry: dayjs().add(15, 'minute').toDate(),
			},
		});

		return code;
	}

	async initiatePasswordRecovery(
		id: string,
		data: Pick<Prisma.userUpdateInput, 'resetPasswordCode' | 'resetPasswordExpiry'>,
	) {
		return this.prisma.user.update({
			where: { id },
			data: {
				resetPasswordCode: data.resetPasswordCode,
				resetPasswordExpiry: data.resetPasswordExpiry,
			},
		});
	}

	async markEmailAsVerified(id: string) {
		const user = await this.get({ where: { id: id } });

		if (!user) {
			return;
		}

		const { pendingEmailAddress } = user;
		return this.prisma.user.update({
			where: { id },
			data: {
				isEmailVerified: true,
				emailVerifyCode: null,
				emailVerifyExpiry: null,
				...(pendingEmailAddress && {
					pendingEmailAddress: null,
					emailAddress: pendingEmailAddress,
				}),
			},
		});
	}

	async recordLogin(id: string, prevLogins: number) {
		return this.prisma.user.update({
			where: { id },
			data: {
				logins: prevLogins + 1,
				lastLogin: dayjs().toISOString(),
			},
		});
	}

	async resetPasswordRecovery(id: string) {
		return this.prisma.user.update({
			where: { id },
			data: {
				resetPasswordCode: null,
				resetPasswordExpiry: null,
			},
		});
	}

	async create(data: CreateAccountInput) {
		return this.prisma.user.create({
			data,
		});
	}

	async update(id: string, data: UpdateAccountInput) {
		const { emailAddress, ...input } = data;
		const parsedEmailAddress = emailAddress?.toLowerCase();

		/*----------  Validation  ----------*/
		const existingUser = await this.get({ where: { id } });
		const existingEmailAddress = await this.get({
			where: { emailAddress },
		});

		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		await updateAccountSchema.parseAsync({ ...input, parsedEmailAddress });
		const withEmailAddressChange = existingUser.emailAddress !== parsedEmailAddress;

		/*----------  Processing  ----------*/
		if (withEmailAddressChange) {
			await this.prisma.user.update({
				where: { id },
				data: {
					pendingEmailAddress: parsedEmailAddress,
					isEmailVerified: false,
				},
			});

			if (existingEmailAddress) {
				return;
			}

			await this.sendVerificationEmail(id);
		}

		return this.prisma.user.update({
			where: { id },
			data: input,
		});
	}

	async sendVerificationEmail(userId: string) {
		/*----------  Validation  ----------*/
		const existingUser = await this.get({
			where: { id: userId },
		});

		if (!existingUser || existingUser?.isEmailVerified) {
			throw new AppException(
				'There was an issue with your email verification request',
				HttpStatus.BAD_REQUEST,
			);
		}

		/*----------  Processing  ----------*/
		const code = await this.initiateEmailVerification(userId);

		return this.mailService.sendEmail(
			existingUser?.pendingEmailAddress || existingUser.emailAddress,
			'Confirm your email address',
			`Use this code to verify your email address: ${code}`,
		);
	}

	async delete(id: string, data: DeleteAccountInput) {
		/*----------  Validation  ----------*/
		await deleteAccountSchema.parseAsync(data);
		const user = await this.get({
			where: { id, emailAddress: data.emailAddress },
		});

		if (!user) {
			throw new AppException(
				'The email address does not match this account',
				HttpStatus.NOT_FOUND,
			);
		}

		/*----------  Processing  ----------*/
		const inboundEmailAddresses = await this.inboundEmailAddressService.getMany(id, {});
		if (inboundEmailAddresses?.length) {
			await Promise.all(
				inboundEmailAddresses.map((address) =>
					this.newsletterSubscriptionManagerService.deleteForInboundEmailAddress(
						address.id,
					),
				),
			);
		}

		return this.prisma.user.delete({
			where: { id },
		});
	}
}
