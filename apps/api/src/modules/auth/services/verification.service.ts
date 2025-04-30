import { HttpStatus, Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import dayjs from 'dayjs';

import { AppException } from '../../../utils/app-exception';
import { generateCode } from '../../../utils/generate-code';
import { UserService } from '../../user/user.service';

@Injectable()
export class VerificationService {
	constructor(private userService: UserService) {}

	async createEmailVerification(userId: number) {
		const code = generateCode();
		const hashedCode = await hash(code);

		await this.userService.initiateEmailVerification(userId, {
			emailVerifyCode: hashedCode,
			emailVerifyExpiry: dayjs().add(15, 'minute').toDate(),
		});

		return code;
	}

	async verifyEmailCode(userId: number, code: string) {
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
			throw new AppException(
				'Invalid or expired verification code',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.userService.markEmailAsVerified(userId);
	}
}
