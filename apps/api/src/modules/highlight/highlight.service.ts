import { HttpStatus, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { createHighlightSchema } from '@inboxt/common';
import { Prisma } from '@inboxt/prisma';

import { GetHighlightsQuery } from '~common/types';
import { AppException } from '~common/utils/app-exception';
import { PrismaService } from '~modules/prisma/prisma.service';
import { SavedItemService } from '~modules/saved-item/saved-item.service';

import { CreateHighlightInput } from './dto/create-highlight.input';
import { DeleteHighlightsInput } from './dto/delete-highlights.input';

@Injectable()
export class HighlightService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly savedItemService: SavedItemService,
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

		// ---------- Reading Progress ----------
		if (query.progress) {
			prismaWhere.saved_item = prismaWhere.saved_item || { is: {} };
			prismaWhere.saved_item.is = prismaWhere.saved_item.is || {};
			prismaWhere.saved_item.is.readingProgress = {
				gte:
					query.progress.from !== undefined
						? (query.progress.from - 0.5) / 100
						: undefined,
				lte: query.progress.to !== undefined ? (query.progress.to + 0.5) / 100 : undefined,
			};
		}

		// ---------- Reading Time ----------
		if (query.readingTime) {
			prismaWhere.saved_item = prismaWhere.saved_item || { is: {} };
			prismaWhere.saved_item.is = prismaWhere.saved_item.is || {};
			prismaWhere.saved_item.is.wordCount = {
				gte: query.readingTime.from ? (query.readingTime.from - 1) * 240 + 1 : undefined,
				lte: query.readingTime.to ? query.readingTime.to * 240 : undefined,
			};
		}

		// ---------- Pagination & Sorting ----------
		const prismaQuery: Prisma.highlightFindManyArgs = {
			where: prismaWhere,
			take: first + 1,
			orderBy: { createdAt: 'desc' },
		};

		if (query.sort?.field && query.sort?.direction) {
			if (['title', 'readingProgress', 'wordCount'].includes(query.sort.field)) {
				prismaQuery.orderBy = {
					saved_item: {
						[query.sort.field]: query.sort.direction,
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
			const savedItem = await this.savedItemService.get(userId, {
				where: { id: data.savedItemId },
				select: { title: true, originalUrl: true },
			});

			const highlight = await prisma.highlight.create({
				data: {
					savedItemId: data.savedItemId,
					savedItemTitle: savedItem?.title,
					savedItemOriginalUrl: savedItem?.originalUrl,
					userId,
				},
			});

			const segmentsData = data.segments.map((s) => {
				return {
					highlightId: highlight.id,
					xpath: s.xpath,
					startOffset: s.startOffset,
					endOffset: s.endOffset,
					text: s.text ?? null,
					beforeText: s.beforeText,
					afterText: s.afterText,
				};
			});

			if (segmentsData.length) {
				await prisma.highlight_segment.createMany({ data: segmentsData });
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

			await this.prisma.highlight.delete({ where: { id: item.id } });
		}
	}
}
