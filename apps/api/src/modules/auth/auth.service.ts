import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { verify } from 'argon2';
import crypto from 'crypto';
import dayjs from 'dayjs';

import {
	signInSchema,
	createAccountSchema,
	requestPasswordRecoverySchema,
	resetPasswordSchema,
	verifyEmailSchema,
} from '@inboxt/common';

import { EMAIL_CHANGED_PASSWORD, EMAIL_RESET_PASSWORD } from '~common/constants/email.constants';
import { UserPlan } from '~common/enums/user-plan.enum';
import { GqlContext } from '~common/types/graphql-context';
import { AppException } from '~common/utils/app-exception';
import { passwordChangedTemplate } from '~mail-templates/passwordChangedTemplate';
import { passwordResetTemplate } from '~mail-templates/passwordResetTemplate';
import { SavedItemManagerService } from '~managers/saved-item-manager/saved-item-manager.service';
import { MailService } from '~modules/mail/mail.service';
import { CreateAccountInput } from '~modules/user/dto/create-account.input';
import { UserService } from '~modules/user/user.service';

import { RequestPasswordRecoveryInput } from './dto/request-password-recovery.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { VerifyEmailInput } from './dto/verify-email.input';
import { PasswordService } from './services/password.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly passwordService: PasswordService,
		private readonly mailService: MailService,
		private readonly savedItemManagerService: SavedItemManagerService,
	) {}

	createJwtToken(payload: Record<string, unknown>, options: JwtSignOptions): string {
		return this.jwtService.sign(payload, options);
	}

	attachJwtToken(name: string, contents: string, context: any, httpOnly = true) {
		context.res.cookie(name, contents, {
			secure: process.env.NODE_ENV === 'production',
			domain: process.env.NODE_ENV === 'production' ? '.inboxt.app' : undefined,
			httpOnly,
			maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
			sameSite: 'lax',
			path: '/',
		});
	}

	async verifyEmailCode(userId: string, code: string) {
		const user = await this.userService.get({
			where: { id: userId },
		});

		const isInvalid =
			!user ||
			!user.emailVerifyCode ||
			!user.emailVerifyExpiry ||
			dayjs().isAfter(dayjs(user.resetPasswordExpiry)) ||
			!(await verify(user.emailVerifyCode, code));

		if (isInvalid) {
			throw new AppException('Invalid or expired verification code', HttpStatus.BAD_REQUEST);
		}

		if (user.pendingEmailAddress) {
			const isDuplicatedEmail = await this.userService.get({
				where: { emailAddress: user.pendingEmailAddress },
			});

			if (isDuplicatedEmail) {
				throw new AppException(
					'Invalid or expired verification code',
					HttpStatus.BAD_REQUEST,
				);
			}
		}

		await this.userService.markEmailAsVerified(userId);
	}

	async verifyEmail(userId: string, data: VerifyEmailInput) {
		await verifyEmailSchema.parseAsync(data);
		return this.verifyEmailCode(userId, data.code);
	}

	signOut(context: GqlContext) {
		context.res.clearCookie('token');
	}

	async createTokens(emailAddress: string, context: any) {
		const user = await this.userService.get({
			where: {
				emailAddress,
			},
		});

		if (!user) {
			return;
		}

		this.attachJwtToken(
			'token',
			this.createJwtToken(
				{
					sub: user.id,
				},
				{ expiresIn: '1d' },
			),
			context,
		);

		await this.userService.recordLogin(user.id, user.logins);
	}

	async signIn(emailAddress: string, password: string, context: any) {
		if (!emailAddress.length || !password.length) {
			throw new AppException('No email and/or password provided', HttpStatus.BAD_REQUEST);
		}

		await signInSchema.parseAsync({ emailAddress, password });
		const user = await this.userService.get({
			where: { emailAddress },
		});

		const isInvalid =
			!user ||
			!user.password ||
			!(await this.passwordService.validatePassword(password, user.password));

		if (isInvalid) {
			throw new AppException('Invalid email address or password', HttpStatus.BAD_REQUEST);
		}

		await this.createTokens(emailAddress, context);
	}

	async createUser(data: CreateAccountInput, context: any) {
		await createAccountSchema.parseAsync(data);
		const emailAddress = data.emailAddress.toLowerCase();
		const existingUser = await this.userService.get({
			where: { emailAddress },
		});

		if (existingUser) {
			return;
		}

		const hashedPassword = await this.passwordService.hashPassword(data.password);
		const user = await this.userService.create({
			...data,
			emailAddress,
			password: hashedPassword,
		});

		await this.savedItemManagerService.createDefaultItems(user.id);
		await this.userService.sendVerificationEmail(user.id);
		await this.createTokens(user.emailAddress, context);
	}

	async createDemo(context: any) {
		const demoId = crypto.randomUUID();
		const username = `demo-${demoId.slice(0, 8)}`;
		const emailAddress = `${username}@demo.inboxt.app`;
		const password = crypto.randomBytes(8).toString('hex');

		// Check if a user with this email somehow exists (very unlikely)
		const existingUser = await this.userService.get({ where: { emailAddress } });
		if (existingUser) {
			await this.createTokens(existingUser.emailAddress, context);
			return existingUser;
		}

		const hashedPassword = await this.passwordService.hashPassword(password);

		const user = await this.userService.createDemoAccount({
			emailAddress,
			password: hashedPassword,
			isEmailVerified: true,
			username,
			plan: 'DEMO',
			storageQuotaBytes: 10_485_760, // 10 MB
		});

		await this.savedItemManagerService.createDefaultItems(user.id);
		await this.createTokens(user.emailAddress, context);

		return user;
	}

	async requestPasswordRecovery(data: RequestPasswordRecoveryInput) {
		await requestPasswordRecoverySchema.parseAsync(data);
		const existingUser = await this.userService.get({
			where: { emailAddress: data.emailAddress },
		});

		if (!existingUser) {
			return;
		}

		if (existingUser.plan == UserPlan.DEMO) {
			return;
		}

		const passwordRecoveryCode = await this.passwordService.createPasswordRecovery(
			existingUser.id,
		);

		await this.mailService.sendTemplate({
			to: data.emailAddress,
			subject: EMAIL_RESET_PASSWORD.subject,
			template: passwordResetTemplate,
			templateData: { code: passwordRecoveryCode },
		});
	}

	async resetPassword(data: ResetPasswordInput) {
		await resetPasswordSchema.parseAsync(data);
		const existingUser = await this.userService.get({
			where: { emailAddress: data.emailAddress },
		});

		if (!existingUser || existingUser.plan === UserPlan.DEMO) {
			throw new AppException(
				'Invalid or expired code, or no reset request was found for this email address',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.passwordService.verifyPasswordRecoveryCode(existingUser.id, data.code);
		const updatedHashedPassword = await this.passwordService.hashPassword(data.password);
		await this.userService.update(existingUser.id, {
			password: updatedHashedPassword,
		});

		await this.mailService.sendTemplate({
			template: passwordChangedTemplate,
			to: data.emailAddress,
			subject: EMAIL_CHANGED_PASSWORD.subject,
			templateData: {
				timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm [UTC]'),
			},
		});
	}
}
