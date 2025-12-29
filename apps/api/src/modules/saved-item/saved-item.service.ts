import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { Prisma } from '@inboxt/prisma';

import { GetSavedItemsQuery } from '~common/types';
import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';
import { QuotaOptions, StorageQuotaService } from '~modules/storage/storage-quota.service';

import { LabelService } from './entities/label/label.service';

@Injectable()
export class SavedItemService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly labelService: LabelService,
		private readonly storageQuota: StorageQuotaService,
	) {}

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
		opts?: QuotaOptions,
	) {
		const skipQuota = opts?.skipQuota ?? false;
		const sizeBytes = skipQuota
			? 0n
			: this.storageQuota.computeSizeBytes({
					title: data.title,
					description: data.description ?? '',
				});

		return this.prisma.$transaction(async (tx) => {
			if (!skipQuota) {
				await this.storageQuota.ensureWithinQuota(userId, sizeBytes);
			}

			const created = await tx.saved_item.create({
				data: { ...data, userId, sizeBytes },
			});

			if (!skipQuota) {
				await this.storageQuota.incrementUsage(tx, userId, sizeBytes);
			}

			return created;
		});
	}

	async update(
		userId: string,
		id: string,
		data: Omit<Prisma.saved_itemUpdateArgs['data'], 'id' | 'userId'>,
		tx?: Prisma.TransactionClient,
		opts?: QuotaOptions,
	) {
		const skipQuota = opts?.skipQuota ?? false;

		const run = async (client: Prisma.TransactionClient) => {
			const existingItem = await this.get(userId, { where: { id } }, client);
			if (!existingItem) {
				throw new AppException('Item not found', HttpStatus.NOT_FOUND);
			}

			const newSizeBytes = skipQuota
				? existingItem.sizeBytes
				: this.storageQuota.computeSizeBytes({
						title:
							data.title !== undefined ? (data.title as string) : existingItem.title,
						description:
							data.description !== undefined
								? (data.description as string)
								: (existingItem.description ?? ''),
					});

			const delta = skipQuota ? 0n : newSizeBytes - existingItem.sizeBytes;
			if (!skipQuota && delta > 0n) {
				await this.storageQuota.ensureWithinQuota(userId, delta);
			}

			const updated = await client.saved_item.update({
				where: { id, userId },
				data: {
					...data,
					sizeBytes: newSizeBytes,
				},
			});

			if (!skipQuota) {
				if (delta > 0n) {
					await this.storageQuota.incrementUsage(client, userId, delta);
				} else if (delta < 0n) {
					await this.storageQuota.decrementUsage(client, userId, -delta);
				}
			}

			return updated;
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

	private async permanentlyDeleteSavedItemTx(
		tx: Prisma.TransactionClient,
		userId: string,
		savedItem: { id: string; sizeBytes: bigint },
	) {
		const article = await tx.article.findUnique({
			where: { savedItemId: savedItem.id, saved_item: { userId } },
			select: { sizeBytes: true },
		});

		const newsletter = await tx.newsletter.findUnique({
			where: { savedItemId: savedItem.id, saved_item: { userId } },
			select: { sizeBytes: true },
		});

		const highlightSegmentsAgg = await tx.highlight_segment.aggregate({
			where: { highlight: { savedItemId: savedItem.id, saved_item: { userId } } },
			_sum: { sizeBytes: true },
		});

		const total =
			savedItem.sizeBytes +
			(article?.sizeBytes ?? 0n) +
			(newsletter?.sizeBytes ?? 0n) +
			(highlightSegmentsAgg._sum.sizeBytes ?? 0n);

		await tx.saved_item.delete({ where: { id: savedItem.id } });
		return total;
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

		return this.prisma.$transaction(async (tx) => {
			const total = await this.permanentlyDeleteSavedItemTx(tx, userId, savedItem);

			if (total > 0n) {
				await this.storageQuota.decrementUsage(tx, userId, total);
			}

			return { id };
		});
	}

	async emptyTrash(userId: string) {
		const trashedItems = await this.getMany(userId, {
			where: { status: 'DELETED', deletedSince: { not: null } },
		});

		if (trashedItems.length === 0) {
			return 0;
		}

		return this.prisma.$transaction(async (tx) => {
			let totalFreed = 0n;

			for (const item of trashedItems) {
				totalFreed += await this.permanentlyDeleteSavedItemTx(tx, userId, item);
			}

			if (totalFreed > 0n) {
				await this.storageQuota.decrementUsage(tx, userId, totalFreed);
			}

			return trashedItems.length;
		});
	}
}
