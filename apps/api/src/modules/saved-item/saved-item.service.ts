import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import { GetSavedItemsInput } from './dto/get-saved-items.input';
import { AppException } from '../../utils/app-exception';

@Injectable()
export class SavedItemService {
	constructor(private prisma: PrismaService) {}

	async get(query: Prisma.saved_itemFindUniqueArgs) {
		return this.prisma.saved_item.findUnique(query);
	}

	async getMany(query: Prisma.saved_itemFindManyArgs) {
		return this.prisma.saved_item.findMany(query);
	}

	async getPaginated(userId: string, data: GetSavedItemsInput) {
		const query: Prisma.saved_itemFindManyArgs = {
			where: { userId, status: data.status || 'ACTIVE' },
			orderBy: { createdAt: 'desc' },
			take: data.first + 1,
		};

		if (data.after) {
			query.cursor = { id: data.after };
			query.skip = 1;
		}

		const items = await this.getMany(query);
		const edges = items.slice(0, data.first).map((item) => ({
			node: item,
			cursor: item.id,
		}));

		return {
			edges,
			endCursor: edges.length ? edges[edges.length - 1].cursor : null,
			hasNextPage: items.length > data.first,
		};
	}

	async create(data: Prisma.saved_itemCreateArgs['data']) {
		return this.prisma.saved_item.create({ data });
	}

	async updateStatus(id: string, status: Prisma.saved_itemUpdateInput['status']) {
		/*----------  Validation  ----------*/
		const existingItem = await this.get({ where: { id } });
		if (!existingItem) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.saved_item.update({
			where: { id },
			data: {
				status,
				deletedSince: status === 'DELETED' ? dayjs().toDate() : null,
			},
		});
	}

	async getLabels(id: string) {
		const labels = await this.prisma.saved_item_label.findMany({
			where: { savedItemId: id },
			include: { label: true },
		});

		return labels.map(({ label }) => label);
	}

	async setLabels(id: string, userId: string, labels: string[]) {
		const validLabels = await this.prisma.label.findMany({
			where: {
				id: { in: labels },
				userId,
			},
			select: { id: true },
		});

		const validLabelIds = validLabels.map((l) => l.id);
		const current = await this.prisma.saved_item_label.findMany({
			where: { savedItemId: id },
			select: { labelId: true },
		});

		const currentIds = current.map((l) => l.labelId);
		const toAdd = validLabelIds.filter((labelId) => !currentIds.includes(labelId));
		const toRemove = currentIds.filter((labelId) => !validLabelIds.includes(labelId));

		await this.prisma.saved_item_label.deleteMany({
			where: { savedItemId: id, labelId: { in: toRemove } },
		});

		await this.prisma.saved_item_label.createMany({
			data: toAdd.map((labelId) => ({ labelId, savedItemId: id })),
			skipDuplicates: true,
		});
	}

	// todo: validation check that user only tries to delete resource that belong to him?
	async delete(id: string) {
		/*----------  Validation  ----------*/
		const savedItem = await this.get({
			where: { id, status: 'DELETED', deletedSince: { not: null } },
		});

		if (!savedItem) {
			throw new AppException(
				'This item does not exist or has already been deleted',
				HttpStatus.NOT_FOUND,
			);
		}

		/*----------  Processing  ----------*/
		return this.prisma.saved_item.delete({
			where: { id },
		});
	}
}
