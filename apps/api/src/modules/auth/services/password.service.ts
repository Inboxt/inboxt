import { HttpStatus, Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import dayjs from 'dayjs';

import { AppException } from '~common/utils/app-exception';
import { generateAuthCode } from '~common/utils/generateAuthCode';

import { UserService } from '../../user/user.service';

@Injectable()
export class PasswordService {
	constructor(private readonly userService: UserService) {}

	async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
		return verify(hashedPassword, password);
	}

	async hashPassword(password: string): Promise<string> {
		return hash(password);
	}

	async createPasswordRecovery(userId: string) {
		const code = generateAuthCode();
		const hashedCode = await hash(code);

		await this.userService.initiatePasswordRecovery(userId, {
			resetPasswordCode: hashedCode,
			resetPasswordExpiry: dayjs().add(15, 'minute').toDate(),
		});

		return code;
	}

	async verifyPasswordRecoveryCode(userId: string, code: string) {
		const user = await this.userService.get({
			where: { id: userId },
		});

		const isInvalid =
			!user ||
			!user.resetPasswordCode ||
			!user.resetPasswordExpiry ||
			dayjs().isAfter(dayjs(user.resetPasswordExpiry)) ||
			!(await verify(user.resetPasswordCode, code));

		if (isInvalid) {
			throw new AppException(
				'Invalid or expired code, or no reset request was found for this email address',
				HttpStatus.BAD_REQUEST,
			);
		}

		return this.userService.resetPasswordRecovery(userId);
	}
}
