import { HttpStatus, Injectable } from '@nestjs/common';

import { Prisma } from '../../../../../prisma/client';
import { PrismaService } from '../../../../services/prisma.service';
import { AppException } from '../../../../utils/app-exception';
import { createLabelSchema } from '@inbox-reader/schemas';
import { updateLabelSchema } from '@inbox-reader/schemas';

@Injectable()
export class LabelService {
	constructor(private readonly prisma: PrismaService) {}

	async get(userId: string, query: Prisma.labelFindFirstArgs) {
		return this.prisma.label.findFirst({ ...query, where: { ...query.where, userId } });
	}

	async getMany(userId: string, query: Prisma.labelFindManyArgs) {
		return this.prisma.label.findMany({
			...query,
			orderBy: { id: 'asc' },
			where: { ...query.where, userId },
		});
	}

	async create(userId: string, data: Omit<Prisma.labelCreateInput, 'user' | 'userId'>) {
		/*----------  Validation  ----------*/
		await createLabelSchema.parseAsync(data);

		/*----------  Processing  ----------*/
		return this.prisma.label.create({
			data: {
				...data,
				userId,
			},
		});
	}

	async update(userId: string, id: string, data: Omit<Prisma.labelUpdateInput, 'id'>) {
		/*----------  Validation  ----------*/
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

		/*----------  Processing  ----------*/
		return this.prisma.label.update({
			where: { id, userId },
			data,
		});
	}

	async delete(userId: string, id: string) {
		/*----------  Validation  ----------*/
		const label = await this.get(userId, { where: { id } });
		if (!label) {
			throw new AppException('Label not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.label.delete({
			where: { id, userId },
		});
	}
}
