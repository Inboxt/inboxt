import { HttpStatus, Injectable } from '@nestjs/common';

import { Prisma } from '../../../../../prisma/client';
import { PrismaService } from '../../../../services/prisma.service';
import { AppException } from '../../../../utils/app-exception';
import { createLabelSchema } from '@inbox-reader/schemas';
import { updateLabelSchema } from '@inbox-reader/schemas';

@Injectable()
export class LabelService {
	constructor(private readonly prisma: PrismaService) {}

	async get(query: Prisma.labelFindFirstArgs) {
		return this.prisma.label.findFirst(query);
	}

	async getMany(query: Prisma.labelFindManyArgs) {
		return this.prisma.label.findMany({ ...query, orderBy: { id: 'asc' } });
	}

	async create(userId: string, data: Omit<Prisma.labelCreateInput, 'user' | 'userId'>) {
		/*----------  Validation  ----------*/
		await createLabelSchema.parseAsync(data);

		/*----------  Processing  ----------*/
		return this.prisma.label.create({
			data: {
				userId,
				...data,
			},
		});
	}

	async update(id: string, data: Omit<Prisma.labelUpdateInput, 'id'>) {
		/*----------  Validation  ----------*/
		await updateLabelSchema.parseAsync(data);
		const label = await this.get({ where: { id } });
		if (!label) {
			throw new AppException('Label not found', HttpStatus.NOT_FOUND);
		}

		const existingLabel = await this.get({
			where: { name: data.name?.toString(), userId: label.userId },
		});

		if (existingLabel && existingLabel.id !== id) {
			throw new AppException('Label already exists', HttpStatus.BAD_REQUEST);
		}

		/*----------  Processing  ----------*/
		return this.prisma.label.update({
			where: { id },
			data,
		});
	}

	async delete(id: string) {
		/*----------  Validation  ----------*/
		const label = await this.get({ where: { id } });
		if (!label) {
			throw new AppException('Label not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.label.delete({
			where: { id },
		});
	}
}
