import { Injectable, HttpStatus } from '@nestjs/common';

import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';

export type QuotaOptions = { skipQuota?: boolean };

@Injectable()
export class StorageQuotaService {
	constructor(private readonly prisma: PrismaService) {}

	computeSizeBytes(fields: Record<string, string | undefined>) {
		let total = 0;
		for (const value of Object.values(fields)) {
			total += Buffer.byteLength(value ?? '', 'utf8');
		}

		return BigInt(total);
	}

	async ensureWithinQuota(userId: string, delta: bigint) {
		if (delta <= 0n) {
			return;
		}

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { storageUsageBytes: true, storageQuotaBytes: true },
		});

		if (!user) {
			throw new AppException('User not found', HttpStatus.FORBIDDEN);
		}

		if (user.storageUsageBytes + delta > user.storageQuotaBytes) {
			throw new AppException(
				'Storage quota exceeded',
				HttpStatus.FORBIDDEN,
				'STORAGE_QUOTA_EXCEEDED',
			);
		}
	}

	async incrementUsage(tx: any, userId: string, delta: bigint) {
		if (delta <= 0n) {
			return;
		}

		await tx.user.update({
			where: { id: userId },
			data: { storageUsageBytes: { increment: delta } },
		});
	}

	async decrementUsage(tx: Prisma.TransactionClient, userId: string, delta: bigint) {
		if (delta <= 0n) {
			return;
		}

		const user = await tx.user.findUnique({
			where: { id: userId },
			select: { storageUsageBytes: true },
		});

		if (!user) {
			return;
		}

		const current = BigInt(user.storageUsageBytes ?? 0);
		const newValue = current > delta ? current - delta : 0n;

		await tx.user.update({
			where: { id: userId },
			data: { storageUsageBytes: newValue },
		});
	}
}
