import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { Prisma } from '@inboxt/prisma';

import { GetSavedItemsQuery } from '~common/types';
import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';

import { LabelService } from './entities/label/label.service';

@Injectable()
export class SavedItemService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly labelService: LabelService,
	) {}

	async count(userId: string, query: Prisma.saved_itemCountArgs) {
		return this.prisma.saved_item.count({ ...query, where: { ...query.where, userId } });
	}

	async aggregate(userId: string, query: Prisma.Saved_itemAggregateArgs) {
		return this.prisma.saved_item.aggregate({ ...query, where: { ...query.where, userId } });
	}

	async get(
		userId: string,
		query: Prisma.saved_itemFindUniqueArgs,
		tx?: Prisma.TransactionClient,
	) {
		const client = tx ?? this.prisma;
		return client.saved_item.findUnique({ ...query, where: { ...query.where, userId } });
	}

	async getMany(userId: string, query: Prisma.saved_itemFindManyArgs) {
		return this.prisma.saved_item.findMany({ ...query, where: { ...query.where, userId } });
	}

	async getPaginated(userId: string, query: GetSavedItemsQuery) {
		const prismaWhere: Prisma.saved_itemWhereInput = {
			userId,
			status: query?.status,
			parsingStatus: query?.parsingStatus,
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
		if (query?.type) {
			prismaWhere.type = query.type;
		}

		// ---------- Read Status ----------
		if (query?.isRead !== undefined) {
			prismaWhere.readAt = query.isRead ? { not: null } : null;
		}

		// ---------- Labels ----------
		if (query.labels) {
			const orClauses: Prisma.saved_itemWhereInput[] = [];

			if (query.labels.and?.length) {
				query.labels.and.forEach((orGroup) => {
					if (orGroup.length === 1) {
						orClauses.push({
							saved_item_label: {
								some: {
									label: {
										name: {
											equals: orGroup[0],
											mode: 'insensitive',
										},
									},
								},
							},
						});
					} else if (orGroup.length > 1) {
						orClauses.push({
							saved_item_label: {
								some: {
									label: {
										name: {
											in: orGroup.map((l) => l),
											mode: 'insensitive',
										},
									},
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
							label: {
								name: { in: query.labels.not.map((l) => l), mode: 'insensitive' },
							},
						},
					},
				});
			}

			prismaWhere.AND = [...orClauses, ...notClauses];
		}

		// ---------- Highlights ----------
		if (query.hasHighlights === true) {
			prismaWhere.highlight = { some: { userId } };
		}

		if (query.hasHighlights === false) {
			prismaWhere.highlight = { none: { userId } };
		}

		// ---------- No labels ----------
		if (query.noLabels === true) {
			prismaWhere.saved_item_label = { none: {} };
		}

		if (query.noLabels === false) {
			prismaWhere.saved_item_label = { some: {} };
		}

		// ---------- Saved date range ----------
		if (query.saved) {
			const createdAt: Prisma.DateTimeFilter = {};
			if (query.saved.from) {
				const from = dayjs(query.saved.from);
				if (from.isValid()) {
					createdAt.gte = from.toDate();
				}
			}

			if (query.saved.to) {
				const to = dayjs(query.saved.to);
				if (to.isValid()) {
					createdAt.lte = to.toDate();
				}
			}

			if (Object.keys(createdAt).length) {
				prismaWhere.createdAt = createdAt;
			}
		}

		// ---------- Source ----------
		if (query.source) {
			prismaWhere.sourceDomain = { contains: query.source, mode: 'insensitive' };
		}

		// ---------- Reading Progress ----------
		if (query.progress) {
			prismaWhere.readingProgress = {
				gte:
					query.progress.from !== undefined
						? (query.progress.from - 0.5) / 100
						: undefined,
				lte: query.progress.to !== undefined ? (query.progress.to + 0.5) / 100 : undefined,
			};
		}

		// ---------- Reading Time ----------
		if (query.readingTime) {
			prismaWhere.wordCount = {
				gte: query.readingTime.from ? (query.readingTime.from - 1) * 240 + 1 : undefined,
				lte: query.readingTime.to ? query.readingTime.to * 240 : undefined,
			};
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
		const edges = items.map((item) => ({ node: item, cursor: item.id }));

		return {
			edges,
		};
	}

	async create(
		userId: string,
		data: Omit<Prisma.saved_itemCreateArgs['data'], 'userId' | 'user'>,
	) {
		return this.prisma.saved_item.create({
			data: { ...data, userId },
		});
	}

	async update(
		userId: string,
		id: string,
		data: Omit<Prisma.saved_itemUpdateArgs['data'], 'id' | 'userId'>,
		tx?: Prisma.TransactionClient,
	) {
		const run = async (client: Prisma.TransactionClient) => {
			const existingItem = await this.get(userId, { where: { id } }, client);
			if (!existingItem) {
				throw new AppException('Item not found', HttpStatus.NOT_FOUND);
			}

			return client.saved_item.update({
				where: { id, userId },
				data: {
					...data,
				},
			});
		};

		if (tx) {
			return run(tx);
		}

		return this.prisma.$transaction(async (client) => run(client));
	}

	async updateStatus(userId: string, id: string, status: Prisma.saved_itemUpdateInput['status']) {
		const existingItem = await this.get(userId, { where: { id } });
		if (!existingItem) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.saved_item.update({
			where: { id, userId },
			data: {
				status,
				deletedSince: status === 'DELETED' ? dayjs().toDate() : null,
			},
		});
	}

	async updateReadingProgress(userId: string, id: string, readingProgress: number) {
		const existingItem = await this.get(userId, { where: { id } });
		if (!existingItem) {
			throw new AppException('Item not found', HttpStatus.NOT_FOUND);
		}

		const data: Prisma.saved_itemUpdateInput = {
			readingProgress,
		};

		if (readingProgress > 0.95 && !existingItem.isReadManual && !existingItem.readAt) {
			data.readAt = dayjs().toDate();
		}

		return this.prisma.saved_item.update({
			where: { id, userId },
			data,
		});
	}

	async updateManyReadStatus(userId: string, ids: string[], isRead: boolean) {
		await this.prisma.saved_item.updateMany({
			where: { id: { in: ids }, userId },
			data: {
				readAt: isRead ? dayjs().toDate() : null,
				isReadManual: true,
			},
		});

		return this.getMany(userId, { where: { id: { in: ids } } });
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

		await this.prisma.saved_item_label.deleteMany({
			where: { savedItemId: id, labelId: { in: toRemove } },
		});

		await this.prisma.saved_item_label.createMany({
			data: toAdd.map((labelId) => ({ labelId, savedItemId: id })),
			skipDuplicates: true,
		});
	}

	async setManyLabels(
		userId: string,
		ids: string[],
		labels?: { add?: string[]; remove?: string[]; set?: string[] },
	) {
		const items = await this.getMany(userId, {
			where: {
				id: { in: ids },
			},
			select: { id: true },
		});

		if (items.length === 0) {
			return [];
		}

		const itemIds = items.map((i) => i.id);

		if (labels?.set) {
			const validLabels = await this.labelService.getMany(userId, {
				where: {
					id: { in: labels.set },
				},
				select: { id: true },
			});
			const validLabelIds = validLabels.map((l) => l.id);

			await this.prisma.$transaction(async (tx) => {
				await tx.saved_item_label.deleteMany({
					where: { savedItemId: { in: itemIds } },
				});

				const data: Prisma.saved_item_labelCreateManyInput[] = [];
				for (const itemId of itemIds) {
					for (const labelId of validLabelIds) {
						data.push({ labelId, savedItemId: itemId });
					}
				}

				await tx.saved_item_label.createMany({
					data,
					skipDuplicates: true,
				});
			});
		} else {
			if (labels?.add?.length) {
				const validLabels = await this.labelService.getMany(userId, {
					where: {
						id: { in: labels.add },
					},
					select: { id: true },
				});
				const validLabelIds = validLabels.map((l) => l.id);

				const data: Prisma.saved_item_labelCreateManyInput[] = [];
				for (const itemId of itemIds) {
					for (const labelId of validLabelIds) {
						data.push({ labelId, savedItemId: itemId });
					}
				}

				await this.prisma.saved_item_label.createMany({
					data,
					skipDuplicates: true,
				});
			}

			if (labels?.remove?.length) {
				await this.prisma.saved_item_label.deleteMany({
					where: {
						savedItemId: { in: itemIds },
						labelId: { in: labels.remove },
					},
				});
			}
		}

		return this.getMany(userId, { where: { id: { in: itemIds } } });
	}

	async delete(userId: string, id: string) {
		const savedItem = await this.get(userId, {
			where: { id, userId, status: 'DELETED', deletedSince: { not: null } },
		});

		if (!savedItem) {
			throw new AppException(
				'This item does not exist or has already been deleted',
				HttpStatus.NOT_FOUND,
			);
		}

		return this.prisma.saved_item.delete({ where: { id, userId } });
	}

	async emptyTrash(userId: string) {
		const trashedItems = await this.getMany(userId, {
			where: { status: 'DELETED', deletedSince: { not: null } },
		});

		if (trashedItems.length === 0) {
			return 0;
		}

		for (const item of trashedItems) {
			await this.prisma.saved_item.delete({ where: { id: item.id, userId } });
		}

		return trashedItems.length;
	}
}
