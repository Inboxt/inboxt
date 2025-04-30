import { hash, verify } from 'argon2';
import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { generateCode } from '../../../utils/generate-code';
import { AppException } from '../../../utils/app-exception';
import { UserService } from '../../user/user.service';

@Injectable()
export class PasswordService {
	constructor(private userService: UserService) {}

	async validatePassword(
		password: string,
		hashedPassword: string,
	): Promise<boolean> {
		return verify(hashedPassword, password);
	}

	async hashPassword(password: string): Promise<string> {
		return hash(password);
	}

	async createPasswordRecovery(userId: number) {
		const code = generateCode();
		const hashedCode = await hash(code);

		await this.userService.initiatePasswordRecovery(userId, {
			resetPasswordCode: hashedCode,
			resetPasswordExpiry: dayjs().add(15, 'minute').toDate(),
		});

		return code;
	}

	async verifyPasswordRecoveryCode(userId: number, code: string) {
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
