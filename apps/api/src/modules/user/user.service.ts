import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import dayjs from 'dayjs';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async get(query: Prisma.userFindUniqueArgs) {
		return this.prisma.user.findUnique(query);
	}

	async initiateEmailVerification(
		id: number,
		data: Pick<
			Prisma.userUpdateInput,
			'emailVerifyCode' | 'emailVerifyExpiry'
		>,
	) {
		return this.prisma.user.update({
			where: { id },
			data: {
				emailVerifyCode: data.emailVerifyCode,
				emailVerifyExpiry: data.emailVerifyExpiry,
			},
		});
	}

	async initiatePasswordRecovery(
		id: number,
		data: Pick<
			Prisma.userUpdateInput,
			'resetPasswordCode' | 'resetPasswordExpiry'
		>,
	) {
		return this.prisma.user.update({
			where: { id },
			data: {
				resetPasswordCode: data.resetPasswordCode,
				resetPasswordExpiry: data.resetPasswordExpiry,
			},
		});
	}

	async markEmailAsVerified(id: number) {
		return this.prisma.user.update({
			where: { id },
			data: {
				isEmailVerified: true,
				emailVerifyCode: null,
				emailVerifyExpiry: null,
			},
		});
	}

	async recordLogin(id: number, prevLogins: number) {
		return this.prisma.user.update({
			where: { id },
			data: {
				logins: prevLogins + 1,
				lastLogin: dayjs().toISOString(),
			},
		});
	}

	async resetPasswordRecovery(id: number) {
		return this.prisma.user.update({
			where: { id },
			data: {
				resetPasswordCode: null,
				resetPasswordExpiry: null,
			},
		});
	}
}
