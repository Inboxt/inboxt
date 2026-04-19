import { HttpStatus, Injectable } from '@nestjs/common';

import { createSavedQuerySchema, updateSavedQuerySchema } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';

@Injectable()
export class SavedQueryService {
	constructor(private readonly prisma: PrismaService) {}

	async get(userId: string, query: Prisma.saved_queryFindFirstArgs) {
		return this.prisma.saved_query.findFirst({ ...query, where: { ...query.where, userId } });
	}

	async getMany(userId: string, query: Prisma.saved_queryFindManyArgs) {
		return this.prisma.saved_query.findMany({
			...query,
			orderBy: { createdAt: 'asc' },
			where: { ...query.where, userId },
		});
	}

	async create(userId: string, data: Omit<Prisma.saved_queryCreateInput, 'user' | 'userId'>) {
		await createSavedQuerySchema.parseAsync(data);
		return this.prisma.saved_query.create({
			data: {
				...data,
				userId,
			},
		});
	}

	async update(userId: string, id: string, data: Omit<Prisma.saved_queryUpdateInput, 'id'>) {
		await updateSavedQuerySchema.parseAsync({ id, ...data });
		const savedQuery = await this.get(userId, { where: { id } });
		if (!savedQuery) {
			throw new AppException('Saved query not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.saved_query.update({
			where: { id, userId },
			data,
		});
	}

	async delete(userId: string, id: string) {
		const savedQuery = await this.get(userId, { where: { id } });
		if (!savedQuery) {
			throw new AppException('Saved query not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.saved_query.delete({
			where: { id, userId },
		});
	}
}
