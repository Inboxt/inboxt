import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { hash } from 'argon2';

import { updateAccountSchema, deleteAccountSchema } from '@inboxt/common';

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
import { verifyEmailTemplate } from '../../mail-templates/verifyEmailTemplate';
import {
	EMAIL_ACCOUNT_DELETED,
	EMAIL_CHANGED_EMAIL,
	EMAIL_VERIFY,
	EMAIL_WELCOME,
} from '../../common/constants/email.constants';
import { accountDeletedTemplate } from '../../mail-templates/accountDeletedTemplate';
import { welcomeTemplate } from '../../mail-templates/welcomeTemplate';
import { emailChangedTemplate } from '../../mail-templates/emailChangedTemplate';
import { UserPlan } from '../../enums/user-plan.enum';

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
		if (pendingEmailAddress) {
			await this.mailService.sendTemplate({
				template: emailChangedTemplate,
				subject: EMAIL_CHANGED_EMAIL.subject,
				to: user.emailAddress,
				templateData: {
					timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm'),
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
		const user = await this.prisma.user.create({
			data,
		});

		await this.mailService.sendTemplate({
			to: data.emailAddress,
			subject: EMAIL_WELCOME.subject,
			template: welcomeTemplate,
			templateData: {},
		});

		return user;
	}

	async createDemoAccount(data: Prisma.userCreateInput) {
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
		const withEmailAddressChange =
			existingUser.emailAddress !== parsedEmailAddress && !!emailAddress;

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

			await this.sendVerificationEmail(id, true);
		}

		return this.prisma.user.update({
			where: { id },
			data: input,
		});
	}

	async sendVerificationEmail(userId: string, isEmailChange = false) {
		/*----------  Validation  ----------*/
		const existingUser = await this.get({
			where: { id: userId },
		});

		if (!existingUser || existingUser?.isEmailVerified || existingUser.plan === UserPlan.DEMO) {
			throw new AppException(
				'There was an issue with your email verification request',
				HttpStatus.BAD_REQUEST,
			);
		}

		/*----------  Processing  ----------*/
		const code = await this.initiateEmailVerification(userId);

		return this.mailService.sendTemplate({
			to: existingUser.pendingEmailAddress || existingUser.emailAddress,
			subject: EMAIL_VERIFY.subject,
			template: verifyEmailTemplate,
			templateData: { code, isEmailChange },
		});
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

		await this.prisma.user.delete({
			where: { id },
		});

		await this.mailService.sendTemplate({
			to: data.emailAddress,
			subject: EMAIL_ACCOUNT_DELETED.subject,
			template: accountDeletedTemplate,
			templateData: {
				timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm'),
			},
		});
	}
}
