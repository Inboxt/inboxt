import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import { GetSavedItemsInput } from './dto/get-saved-items.input';
import { AppException } from '../../utils/app-exception';
import { LabelService } from './entities/label/label.service';

@Injectable()
export class SavedItemService {
	constructor(
		private prisma: PrismaService,
		private labelService: LabelService,
	) {}

	async get(userId: string, query: Prisma.saved_itemFindUniqueArgs) {
		return this.prisma.saved_item.findUnique({ ...query, where: { ...query.where, userId } });
	}

	async getMany(userId: string, query: Prisma.saved_itemFindManyArgs) {
		return this.prisma.saved_item.findMany({ ...query, where: { ...query.where, userId } });
	}

	async getPaginated(userId: string, query: GetSavedItemsInput) {
		const prismaWhere: Prisma.saved_itemWhereInput = {
			userId,
			status: query?.status || 'ACTIVE',
		};

		if (query?.type) {
			prismaWhere.type = query.type;
		}

		if (query?.labelId) {
			prismaWhere.saved_item_label = {
				some: {
					labelId: query.labelId,
				},
			};
		}

		const prismaQuery: Prisma.saved_itemFindManyArgs = {
			where: prismaWhere,
			take: query.first + 1,
		};

		if (query?.sort?.field && query?.sort?.direction) {
			prismaQuery.orderBy = { [query.sort.field]: query.sort.direction };
		}

		if (query?.after) {
			prismaQuery.cursor = { id: query.after };
			prismaQuery.skip = 1;
		}

		const items = await this.getMany(userId, prismaQuery);
		const edges = items.slice(0, query.first).map((item) => ({
			node: item,
			cursor: item.id,
		}));

		return {
			edges,
			endCursor: edges.length ? edges[edges.length - 1].cursor : null,
			hasNextPage: items.length > query.first,
		};
	}

	async create(
		userId: string,
		data: Omit<Prisma.saved_itemCreateArgs['data'], 'userId' | 'user'>,
	) {
		return this.prisma.saved_item.create({ data: { ...data, userId } });
	}

	async update(
		userId: string,
		id: string,
		data: Omit<Prisma.saved_itemUpdateArgs['data'], 'id' | 'userId'>,
	) {
		const existingItem = await this.get(userId, { where: { id } });
		if (!existingItem) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.saved_item.update({ where: { id, userId }, data });
	}

	async updateStatus(userId: string, id: string, status: Prisma.saved_itemUpdateInput['status']) {
		/*----------  Validation  ----------*/
		const existingItem = await this.get(userId, { where: { id } });
		if (!existingItem) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		/*----------  Processing  ----------*/
		return this.prisma.saved_item.update({
			where: { id, userId },
			data: {
				status,
				deletedSince: status === 'DELETED' ? dayjs().toDate() : null,
			},
		});
	}

	async getLabels(userId: string, id: string) {
		const savedItem = await this.get(userId, { where: { id } });
		if (!savedItem) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		const labels = await this.prisma.saved_item_label.findMany({
			where: { savedItemId: id },
			include: { label: true },
		});

		return labels.map(({ label }) => label);
	}

	async setLabels(userId: string, id: string, labels: string[]) {
		/*----------  Validation  ----------*/
		const item = await this.get(userId, { where: { id } });
		if (!item) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		const validLabels = await this.labelService.getMany(userId, {
			where: {
				id: { in: labels },
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

		if (!toAdd.length && !toRemove.length) {
			return;
		}

		/*----------  Processing  ----------*/
		await this.prisma.saved_item_label.deleteMany({
			where: { savedItemId: id, labelId: { in: toRemove } },
		});

		await this.prisma.saved_item_label.createMany({
			data: toAdd.map((labelId) => ({ labelId, savedItemId: id })),
			skipDuplicates: true,
		});
	}

	async delete(userId: string, id: string) {
		/*----------  Validation  ----------*/
		const savedItem = await this.get(userId, {
			where: { id, userId, status: 'DELETED', deletedSince: { not: null } },
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
