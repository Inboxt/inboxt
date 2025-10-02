import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import { AppException } from '../../utils/app-exception';
import { LabelService } from './entities/label/label.service';
import { GetSavedItemsQuery } from '../../common/types';

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

	async getPaginated(userId: string, query: GetSavedItemsQuery) {
		let prismaWhere: Prisma.saved_itemWhereInput = {
			userId,
			status: query?.status,
		};

		// ---------- Free text ----------
		if (query?.text) {
			prismaWhere.OR = [
				{ title: { contains: query.text, mode: 'insensitive' } },
				{ description: { contains: query.text, mode: 'insensitive' } },
				{ article: { is: { contentText: { contains: query.text, mode: 'insensitive' } } } },
				{
					newsletter: {
						is: { contentText: { contains: query.text, mode: 'insensitive' } },
					},
				},
			];
		}

		// ---------- Type ----------
		if (query?.type) prismaWhere.type = query.type;

		// ---------- Labels ----------
		if (query.labels) {
			const orClauses: Prisma.saved_itemWhereInput[] = [];

			if (query.labels.and?.length) {
				query.labels.and.forEach((orGroup) => {
					if (orGroup.length === 1) {
						orClauses.push({
							saved_item_label: {
								some: { label: { name: { equals: orGroup[0].toLowerCase() } } },
							},
						});
					} else if (orGroup.length > 1) {
						orClauses.push({
							saved_item_label: {
								some: {
									label: { name: { in: orGroup.map((l) => l.toLowerCase()) } },
								},
							},
						});
					}
				});
			}

			const notClauses: Prisma.saved_itemWhereInput[] = [];
			if (query.labels.not?.length) {
				notClauses.push({
					saved_item_label: {
						none: {
							label: { name: { in: query.labels.not.map((l) => l.toLowerCase()) } },
						},
					},
				});
			}

			prismaWhere.AND = [...orClauses, ...notClauses];
		}

		// ---------- Highlights ----------
		if (query.hasHighlights === true) prismaWhere.highlight = { some: { userId } };
		if (query.hasHighlights === false) prismaWhere.highlight = { none: { userId } };

		// ---------- Saved date range ----------
		if (query.saved) {
			const createdAt: Prisma.DateTimeFilter = {};
			if (query.saved.from) {
				const from = dayjs(query.saved.from);
				if (from.isValid()) createdAt.gte = from.toDate();
			}
			if (query.saved.to) {
				const to = dayjs(query.saved.to);
				if (to.isValid()) createdAt.lte = to.toDate();
			}
			if (Object.keys(createdAt).length) prismaWhere.createdAt = createdAt;
		}

		// ---------- Source ----------
		if (query.source) {
			prismaWhere.sourceDomain = { contains: query.source, mode: 'insensitive' };
		}

		// ---------- Pagination & Sorting ----------
		const take = query.first ?? 20;
		const prismaQuery: Prisma.saved_itemFindManyArgs = {
			where: prismaWhere,
			take: take + 1,
		};

		if (query.sort?.field && query.sort?.direction) {
			prismaQuery.orderBy = { [query.sort.field]: query.sort.direction };
		}

		if (query.after) {
			prismaQuery.cursor = { id: query.after };
			prismaQuery.skip = 1;
		}

		const items = await this.getMany(userId, prismaQuery);
		const edges = items.slice(0, take).map((item) => ({ node: item, cursor: item.id }));

		return {
			edges,
			endCursor: edges.length ? edges[edges.length - 1].cursor : null,
			hasNextPage: items.length > take,
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
