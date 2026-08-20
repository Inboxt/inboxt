import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { Prisma } from '@inboxt/prisma';

import { PrismaService } from '~modules/prisma/prisma.service';

@Injectable()
export class UserStatsService {
	constructor(private readonly prisma: PrismaService) {}

	async getStats(userId: string) {
		const now = dayjs();
		const startOfMonth = now.startOf('month').toDate();
		const startOfWeek = now.startOf('week').toDate();

		const [readAllTime, readMonth, readWeek, totalSaved, unreadItems] = await Promise.all([
			this.prisma.user_reading_log.findMany({
				where: { userId },
				select: { wordCount: true, readAt: true, savedItemCreatedAt: true },
			}),
			this.prisma.user_reading_log.count({
				where: { userId, readAt: { gte: startOfMonth } },
			}),
			this.prisma.user_reading_log.count({
				where: { userId, readAt: { gte: startOfWeek } },
			}),
			this.prisma.saved_item.aggregate({
				where: { userId },
				_avg: { wordCount: true },
				_count: true,
			}),
			this.prisma.saved_item.count({
				where: { userId, readAt: null },
			}),
		]);

		const totalWordsRead = readAllTime.reduce((acc, item) => acc + (item.wordCount || 0), 0);
		const estimatedReadingTimeCompleted = totalWordsRead / 240;

		const timesToFinish = readAllTime
			.filter((item) => item.readAt && item.savedItemCreatedAt)
			.map((item) => dayjs(item.readAt).diff(dayjs(item.savedItemCreatedAt), 'day', true));

		const averageTimeToFinish =
			timesToFinish.length > 0
				? timesToFinish.reduce((acc, val) => acc + val, 0) / timesToFinish.length
				: null;

		return {
			itemsReadCountAllTime: readAllTime.length,
			itemsReadCountMonth: readMonth,
			itemsReadCountWeek: readWeek,
			estimatedReadingTimeCompleted,
			wordsReadCount: totalWordsRead,
			unreadCount: unreadItems,
			readCount: readAllTime.length,
			averageArticleLength: totalSaved._avg?.wordCount || 0,
			averageTimeToFinish,
		};
	}

	async getReadingLogs(userId: string) {
		return this.prisma.user_reading_log.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		});
	}

	async createReadingLogs(
		userId: string,
		logs: Array<{
			savedItemId?: string | null;
			wordCount: number;
			savedItemCreatedAt: Date;
			readAt: Date;
			createdAt?: Date;
		}>,
	) {
		if (!logs.length) {
			return [];
		}
		return this.prisma.user_reading_log.createMany({
			data: logs.map((log) => ({
				userId,
				savedItemId: log.savedItemId ?? null,
				wordCount: log.wordCount,
				savedItemCreatedAt: log.savedItemCreatedAt,
				readAt: log.readAt,
				createdAt: log.createdAt ?? log.readAt,
			})),
		});
	}

	async logReadingEvent(
		userId: string,
		data: {
			savedItemId: string;
			wordCount: number;
			savedItemCreatedAt: Date;
			readAt: Date;
		},
		tx?: Prisma.TransactionClient,
	) {
		const client = tx ?? this.prisma;
		await client.user_reading_log.deleteMany({
			where: { userId, savedItemId: data.savedItemId },
		});

		return client.user_reading_log.create({
			data: {
				userId,
				savedItemId: data.savedItemId,
				wordCount: data.wordCount,
				savedItemCreatedAt: data.savedItemCreatedAt,
				readAt: data.readAt,
			},
		});
	}

	async logManyReadingEvents(
		userId: string,
		items: Array<{
			savedItemId: string;
			wordCount: number;
			savedItemCreatedAt: Date;
			readAt: Date;
		}>,
		tx?: Prisma.TransactionClient,
	) {
		if (!items.length) {
			return [];
		}
		const client = tx ?? this.prisma;
		await client.user_reading_log.deleteMany({
			where: {
				userId,
				savedItemId: { in: items.map((i) => i.savedItemId) },
			},
		});

		return client.user_reading_log.createMany({
			data: items.map((item) => ({
				userId,
				savedItemId: item.savedItemId,
				wordCount: item.wordCount,
				savedItemCreatedAt: item.savedItemCreatedAt,
				readAt: item.readAt,
			})),
		});
	}

	async removeReadingLogsForItems(
		userId: string,
		savedItemIds: string[],
		tx?: Prisma.TransactionClient,
	) {
		if (!savedItemIds.length) {
			return;
		}
		const client = tx ?? this.prisma;
		return client.user_reading_log.deleteMany({
			where: {
				userId,
				savedItemId: { in: savedItemIds },
			},
		});
	}

	async syncReadingLogWordCount(
		userId: string,
		savedItemId: string,
		wordCount: number,
		tx?: Prisma.TransactionClient,
	) {
		const client = tx ?? this.prisma;
		return client.user_reading_log.updateMany({
			where: { savedItemId, userId },
			data: { wordCount },
		});
	}
}
