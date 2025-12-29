import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { createHighlightSchema } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import { GetHighlightsQuery } from '~common/types';
import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';
import { StorageQuotaService } from '~modules/storage/storage-quota.service';

import { CreateHighlightInput } from './dto/create-highlight.input';
import { DeleteHighlightsInput } from './dto/delete-highlights.input';

@Injectable()
export class HighlightService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly storageQuota: StorageQuotaService,
	) {}

	async get(userId: string, query: Prisma.highlightFindFirstArgs) {
		return this.prisma.highlight.findFirst({ ...query, where: { ...query.where, userId } });
	}

	async getMany(userId: string, query: Prisma.highlightFindManyArgs) {
		return this.prisma.highlight.findMany({ ...query, where: { ...query.where, userId } });
	}

	async getSegments(userId: string, id: string) {
		const highlight = await this.get(userId, { where: { id } });
		if (!highlight) {
			throw new AppException('Highlight segments not found', HttpStatus.NOT_FOUND);
		}

		return this.prisma.highlight_segment.findMany({
			where: { highlightId: id },
		});
	}

	async getPaginated(userId: string, query: GetHighlightsQuery) {
		const first = query.first ?? 20;
		const prismaWhere: Prisma.highlightWhereInput = {
			userId,
		};

		// ---------- Free text search ----------
		if (query.text) {
			prismaWhere.saved_item = {
				is: {
					OR: [
						{ title: { contains: query.text, mode: 'insensitive' } },
						{ description: { contains: query.text, mode: 'insensitive' } },
						{
							article: {
								is: { contentText: { contains: query.text, mode: 'insensitive' } },
							},
						},
						{
							newsletter: {
								is: { contentText: { contains: query.text, mode: 'insensitive' } },
							},
						},
					],
				},
			};
		}

		// ---------- Source filter ----------
		if (query.source) {
			prismaWhere.saved_item = prismaWhere.saved_item || { is: {} };
			prismaWhere.saved_item.is = prismaWhere.saved_item.is || {};
			prismaWhere.saved_item.is.sourceDomain = {
				contains: query.source,
				mode: 'insensitive',
			};
		}

		// ---------- Saved date range ----------
		if (query.saved) {
			prismaWhere.saved_item = prismaWhere.saved_item || { is: {} };
			prismaWhere.saved_item.is = prismaWhere.saved_item.is || {};
			const createdAtFilter: Prisma.DateTimeFilter = {};

			if (query.saved.from) {
				const fromDate = dayjs(query.saved.from);
				if (fromDate.isValid()) {
					createdAtFilter.gte = fromDate.toDate();
				}
			}

			if (query.saved.to) {
				const toDate = dayjs(query.saved.to);
				if (toDate.isValid()) {
					createdAtFilter.lte = toDate.toDate();
				}
			}

			if (Object.keys(createdAtFilter).length) {
				prismaWhere.saved_item.is.createdAt = createdAtFilter;
			}
		}

		// ---------- Pagination & Sorting ----------
		const prismaQuery: Prisma.highlightFindManyArgs = {
			where: prismaWhere,
			take: first + 1,
			orderBy: { createdAt: 'desc' },
		};

		if (query.sort?.field && query.sort?.direction) {
			if (query.sort.field === 'title') {
				prismaQuery.orderBy = {
					saved_item: {
						title: query.sort.direction,
					},
				};
			} else {
				prismaQuery.orderBy = { [query.sort.field]: query.sort.direction };
			}
		}

		if (query.after) {
			prismaQuery.cursor = { id: query.after };
			prismaQuery.skip = 1;
		}

		const items = await this.prisma.highlight.findMany(prismaQuery);
		const edges = items.map((node) => ({
			node,
			cursor: node.id,
		}));

		return {
			edges,
		};
	}

	async create(userId: string, data: CreateHighlightInput) {
		await createHighlightSchema.parseAsync(data);
		return this.prisma.$transaction(async (prisma) => {
			const highlight = await prisma.highlight.create({
				data: {
					savedItemId: data.savedItemId,
					userId,
				},
			});

			let totalDelta = 0n;
			const segmentsData = data.segments.map((s) => {
				const sizeBytes = this.storageQuota.computeSizeBytes({
					xpath: s.xpath,
					beforeText: s.beforeText,
					afterText: s.afterText,
					text: s.text ?? '',
				});

				totalDelta += sizeBytes;

				return {
					highlightId: highlight.id,
					xpath: s.xpath,
					startOffset: s.startOffset,
					endOffset: s.endOffset,
					text: s.text ?? null,
					beforeText: s.beforeText,
					afterText: s.afterText,
					sizeBytes,
				};
			});

			if (totalDelta > 0n) {
				await this.storageQuota.ensureWithinQuota(userId, totalDelta);
			}

			if (segmentsData.length) {
				await prisma.highlight_segment.createMany({ data: segmentsData });
			}

			if (totalDelta > 0n) {
				await this.storageQuota.incrementUsage(prisma, userId, totalDelta);
			}

			return highlight;
		});
	}

	async delete(userId: string, data: DeleteHighlightsInput) {
		for (const item of data.items) {
			const existingHighlight = await this.get(userId, { where: { id: item.id } });

			if (!existingHighlight) {
				throw new AppException('Highlight not found', HttpStatus.NOT_FOUND);
			}

			if (existingHighlight.userId !== userId) {
				throw new AppException(
					'You do not have permission to delete highlight',
					HttpStatus.FORBIDDEN,
				);
			}

			if (
				existingHighlight.savedItemId &&
				existingHighlight.savedItemId !== item.savedItemId
			) {
				throw new AppException(
					'Highlight does not belong to the specified saved item',
					HttpStatus.BAD_REQUEST,
				);
			}

			await this.prisma.$transaction(async (tx) => {
				const sum = await tx.highlight_segment.aggregate({
					where: { highlightId: item.id },
					_sum: { sizeBytes: true },
				});

				const total = sum._sum.sizeBytes || 0n;
				await tx.highlight.delete({ where: { id: item.id } });

				if (total > 0n) {
					await this.storageQuota.decrementUsage(tx, userId, total);
				}
			});
		}
	}
}
