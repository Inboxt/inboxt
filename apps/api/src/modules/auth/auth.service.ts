import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { PrismaService } from '../../services/prisma.service';
import { GqlContext } from '../../types/graphql-context';
import { AppException } from '../../utils/app-exception';
import { PasswordService } from './services/password.service';
import { VerifyEmailInput } from './dto/verify-email.input';
import { CreateAccountInput } from '../user/dto/create-account.input';
import { MailService } from '../mail/mail.service';
import { VerificationService } from './services/verification.service';
import { RequestPasswordRecoveryInput } from './dto/request-password-recovery.input';
import { ResetPasswordInput } from './dto/reset-password.input';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private prisma: PrismaService,
		private passwordService: PasswordService,
		private mailService: MailService,
		private verificationService: VerificationService,
	) {}

	createJwtToken(
		payload: Record<string, unknown>,
		options: JwtSignOptions,
	): string {
		return this.jwtService.sign(payload, options);
	}

	attachJwtToken(
		name: string,
		contents: string,
		context: any,
		httpOnly = true,
	) {
		context.res.cookie(name, contents, {
			// secure,
			// domain,
			httpOnly,
			maxAge: 1000 * 60 * 60 * 24, // 1 day
			// sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
		});
	}

	async decodeJwt(token: string) {
		return this.jwtService.decode(token);
	}

	async verifyEmail(userId: number, data: VerifyEmailInput) {
		return this.verificationService.verifyEmailCode(userId, data.code);
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
			throw new AppException(
				'No email and/or password provided',
				HttpStatus.BAD_REQUEST,
			);
		}

		const user = await this.userService.get({
			where: { emailAddress },
		});

		const isInvalid =
			!user ||
			!user.password ||
			!(await this.passwordService.validatePassword(
				password,
				user.password,
			));

		if (isInvalid) {
			throw new AppException(
				'Invalid email address or password',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.createTokens(emailAddress, context);
	}

	async sendVerificationEmail(userId: number) {
		const existingUser = await this.userService.get({
			where: { id: userId },
		});

		if (!existingUser || existingUser?.isEmailVerified) {
			throw new AppException(
				'There was an issue with your email verification request',
				HttpStatus.BAD_REQUEST,
			);
		}

		const verifyEmailCode =
			await this.verificationService.createEmailVerification(userId);

		return this.mailService.sendEmail(
			existingUser.emailAddress,
			'Confirm your email address',
			`Use this code to verify your email address: ${verifyEmailCode}`,
		);
	}

	async createUser(data: CreateAccountInput, context: any) {
		const existingUser = await this.userService.get({
			where: { emailAddress: data.emailAddress },
		});

		if (existingUser) {
			return;
		}

		const hashedPassword = await this.passwordService.hashPassword(
			data.password,
		);

		const user = await this.prisma.user.create({
			data: { ...data, password: hashedPassword },
		});

		await this.sendVerificationEmail(user.id);
		await this.createTokens(data.emailAddress, context);
	}

	async requestPasswordRecovery(data: RequestPasswordRecoveryInput) {
		const existingUser = await this.userService.get({
			where: { emailAddress: data.emailAddress },
		});

		if (!existingUser) {
			return;
		}

		const passwordRecoveryCode =
			await this.passwordService.createPasswordRecovery(existingUser.id);

		return this.mailService.sendEmail(
			data.emailAddress,
			'Your request to recover your password',
			`Use this code to start the process of recovering your password ${passwordRecoveryCode}`,
		);
	}

	async resetPassword(data: ResetPasswordInput) {
		const existingUser = await this.userService.get({
			where: { emailAddress: data.emailAddress },
		});

		if (!existingUser) {
			throw new AppException(
				'Invalid or expired code, or no reset request was found for this email address',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.passwordService.verifyPasswordRecoveryCode(
			existingUser.id,
			data.code,
		);

		const updatedHashedPassword = await this.passwordService.hashPassword(
			data.password,
		);

		await this.prisma.user.update({
			where: {
				id: existingUser.id,
			},
			data: {
				password: updatedHashedPassword,
			},
		});
	}
}
