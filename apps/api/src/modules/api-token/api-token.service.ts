import { HttpStatus, Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import crypto from 'crypto';
import dayjs from 'dayjs';

import { createApiTokenSchema } from '@inboxt/common';

import { ApiTokenExpiry } from '~common/enums/api-token-expiry.enum';
import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';

import { CreateApiTokenInput } from './dto/create-api-token.input';

@Injectable()
export class ApiTokenService {
	constructor(private readonly prisma: PrismaService) {}

	private generateSecretPart(): string {
		return crypto.randomUUID();
	}

	private buildTokenString(id: string, secretPart: string): string {
		return `app_${id}_${secretPart}`;
	}

	private parseTokenString(token: string): { id: string; secretPart: string } {
		if (!token.startsWith('app_')) {
			throw new AppException('Invalid API token format', HttpStatus.UNAUTHORIZED);
		}

		const withoutPrefix = token.slice('app_'.length);
		const [id, secretPart] = withoutPrefix.split('_');

		if (!id || !secretPart) {
			throw new AppException('Invalid API token format', HttpStatus.UNAUTHORIZED);
		}

		return { id, secretPart };
	}

	async createToken(userId: string, input: CreateApiTokenInput) {
		await createApiTokenSchema.parseAsync(input);

		let expiresAt: Date | null = null;
		if (input.expiry !== ApiTokenExpiry.NEVER) {
			const days = parseInt(input.expiry);
			if (!isNaN(days)) {
				expiresAt = dayjs().add(days, 'day').endOf('day').toDate();
			}
		}

		const created = await this.prisma.api_token.create({
			data: {
				userId,
				name: input.name,
				expiresAt,
			},
		});

		const secretPart = this.generateSecretPart();
		const hashed = await hash(secretPart);

		const updated = await this.prisma.api_token.update({
			where: { id: created.id },
			data: {
				token: hashed,
			},
		});

		const { token: _ignored, ...publicToken } = updated;
		const secret = this.buildTokenString(updated.id, secretPart);

		return {
			token: publicToken,
			secret,
		};
	}

	async getMany(userId: string) {
		const tokens = await this.prisma.api_token.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		});

		return tokens.map(({ token, ...rest }) => rest);
	}

	async validateToken(rawToken: string): Promise<{
		user: { id: string };
		apiToken: any;
	}> {
		const now = dayjs().toDate();
		const { id, secretPart } = this.parseTokenString(rawToken);

		const tokenRecord = await this.prisma.api_token.findFirst({
			where: {
				id,
				OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
			},
			include: {
				user: {
					select: { id: true },
				},
			},
		});

		if (!tokenRecord || !tokenRecord.token) {
			throw new AppException('Invalid or expired API token', HttpStatus.UNAUTHORIZED);
		}

		const isMatch = await verify(tokenRecord.token, secretPart).catch(() => false);
		if (!isMatch) {
			throw new AppException('Invalid or expired API token', HttpStatus.UNAUTHORIZED);
		}

		this.prisma.api_token
			.update({
				where: { id: tokenRecord.id },
				data: { lastUsedAt: now },
			})
			.catch(() => undefined);

		const { token: _ignored, user, ...publicToken } = tokenRecord;

		return {
			user,
			apiToken: publicToken,
		};
	}

	async delete(userId: string, id: string) {
		const token = await this.prisma.api_token.findFirst({
			where: { id, userId },
		});

		if (!token) {
			throw new AppException('API token not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.api_token.delete({
			where: { id },
		});
	}
}
