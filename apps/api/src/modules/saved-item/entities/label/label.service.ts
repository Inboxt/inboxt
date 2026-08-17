import { HttpStatus, Injectable } from '@nestjs/common';

import { createLabelSchema, updateLabelSchema } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';

@Injectable()
export class LabelService {
	constructor(private readonly prisma: PrismaService) {}

	async get(userId: string, query: Prisma.labelFindFirstArgs) {
		return this.prisma.label.findFirst({ ...query, where: { ...query.where, userId } });
	}

	async getMany(userId: string, query: Prisma.labelFindManyArgs) {
		return this.prisma.label.findMany({
			...query,
			orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
			where: { ...query.where, userId },
		});
	}

	async create(userId: string, data: Omit<Prisma.labelCreateInput, 'user' | 'userId'>) {
		await createLabelSchema.parseAsync(data);

		const lastLabel = await this.prisma.label.findFirst({
			where: { userId },
			orderBy: { order: 'desc' },
		});

		const order = lastLabel ? lastLabel.order + 1 : 0;

		return this.prisma.label.create({
			data: {
				...data,
				userId,
				order,
			},
		});
	}

	async update(userId: string, id: string, data: Omit<Prisma.labelUpdateInput, 'id'>) {
		await updateLabelSchema.parseAsync(data);
		const label = await this.get(userId, { where: { id } });
		if (!label) {
			throw new AppException('Label not found', HttpStatus.NOT_FOUND);
		}

		const existingLabel = await this.get(userId, {
			where: { name: data.name?.toString() },
		});

		if (existingLabel && existingLabel.id !== id) {
			throw new AppException('Label already exists', HttpStatus.BAD_REQUEST);
		}

		return this.prisma.label.update({
			where: { id, userId },
			data,
		});
	}

	async delete(userId: string, id: string) {
		const label = await this.get(userId, { where: { id } });
		if (!label) {
			throw new AppException('Label not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.label.delete({
			where: { id, userId },
		});
	}

	async reorder(userId: string, ids: string[]) {
		return this.prisma.$transaction(
			ids.map((id, index) =>
				this.prisma.label.update({
					where: { id, userId },
					data: { order: index },
				}),
			),
		);
	}
}
