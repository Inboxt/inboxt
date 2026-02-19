import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'argon2';
import dayjs from 'dayjs';

import { updateAccountSchema, deleteAccountSchema } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import {
	EMAIL_ACCOUNT_DELETED,
	EMAIL_CHANGED_EMAIL,
	EMAIL_VERIFY,
} from '~common/constants/email.constants';
import { AppException } from '~common/utils/app-exception';
import { generateAuthCode } from '~common/utils/generateAuthCode';
import { Config } from '~config/index';
import { accountDeletedTemplate } from '~mail-templates/accountDeletedTemplate';
import { emailChangedTemplate } from '~mail-templates/emailChangedTemplate';
import { verifyEmailTemplate } from '~mail-templates/verifyEmailTemplate';
import { NewsletterSubscriptionManagerService } from '~managers/newsletter-subscription-manager/newsletter-subscription-manager.service';
import { InboundEmailAddressService } from '~modules/inbound-email-address/inbound-email-address.service';
import { MailService } from '~modules/mail/mail.service';
import { PrismaService } from '~modules/prisma/prisma.service';

import { CreateAccountInput } from './dto/create-account.input';
import { DeleteAccountInput } from './dto/delete-account.input';
import { UpdateAccountInput } from './dto/update-account.input';

@Injectable()
export class UserService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
		private readonly inboundEmailAddressService: InboundEmailAddressService,
		private readonly newsletterSubscriptionManagerService: NewsletterSubscriptionManagerService,
		private readonly configService: ConfigService<Config>,
	) {}

	async get(query: Prisma.userFindFirstArgs) {
		return this.prisma.user.findFirst(query);
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
		const code = generateAuthCode();
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
		if (pendingEmailAddress) {
			await this.mailService.sendTemplate({
				template: emailChangedTemplate,
				subject: EMAIL_CHANGED_EMAIL.subject,
				to: user.emailAddress,
				templateData: {
					timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm [UTC]'),
					oldEmail: user.emailAddress,
					newEmail: pendingEmailAddress,
				},
			});
		}

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
				lastLogin: dayjs().toDate(),
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
		const securityConfig = this.configService.getOrThrow('security', { infer: true });
		return this.prisma.user.create({
			data: {
				...data,
				isEmailVerified: !securityConfig.requireEmailVerification,
			},
		});
	}

	async update(id: string, data: UpdateAccountInput) {
		const { emailAddress, ...input } = data;
		const parsedEmailAddress = emailAddress?.toLowerCase();

		const existingUser = await this.get({ where: { id } });
		const existingEmailAddress = await this.get({
			where: { emailAddress },
		});

		if (!existingUser) {
			throw new AppException('User not found', HttpStatus.NOT_FOUND);
		}

		await updateAccountSchema.parseAsync({ ...input, parsedEmailAddress });
		const withEmailAddressChange =
			existingUser.emailAddress !== parsedEmailAddress && !!emailAddress;

		if (withEmailAddressChange) {
			const requireVerification = this.configService.getOrThrow(
				'security.requireEmailVerification',
				{
					infer: true,
				},
			);

			await this.prisma.user.update({
				where: { id },
				data: {
					pendingEmailAddress: parsedEmailAddress,
					isEmailVerified: !requireVerification,
				},
			});

			if (existingEmailAddress) {
				return;
			}

			if (requireVerification) {
				await this.sendVerificationEmail(id, true);
			}
		}

		return this.prisma.user.update({
			where: { id },
			data: input,
		});
	}

	async sendVerificationEmail(userId: string, isEmailChange = false) {
		const requireVerification = this.configService.getOrThrow(
			'security.requireEmailVerification',
			{
				infer: true,
			},
		);

		if (!requireVerification) {
			return;
		}

		const existingUser = await this.get({
			where: { id: userId },
		});

		if (!existingUser || existingUser?.isEmailVerified) {
			throw new AppException(
				'There was an issue with your email verification request',
				HttpStatus.BAD_REQUEST,
			);
		}

		const code = await this.initiateEmailVerification(userId);
		return this.mailService.sendTemplate({
			to: existingUser.pendingEmailAddress || existingUser.emailAddress,
			subject: EMAIL_VERIFY.subject,
			template: verifyEmailTemplate,
			templateData: { code, isEmailChange },
		});
	}

	async recordExportRequest(id: string, timestamp: Date | null) {
		return this.prisma.user.update({
			where: { id },
			data: {
				lastExportAt: timestamp,
			},
		});
	}

	async delete(id: string, data: DeleteAccountInput) {
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

		await this.prisma.user.delete({
			where: { id },
		});

		await this.mailService.sendTemplate({
			to: data.emailAddress,
			subject: EMAIL_ACCOUNT_DELETED.subject,
			template: accountDeletedTemplate,
			templateData: {
				timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm [UTC]'),
			},
		});
	}
}
