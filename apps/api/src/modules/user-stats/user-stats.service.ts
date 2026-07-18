import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { SavedItemService } from '~modules/saved-item/saved-item.service';

@Injectable()
export class UserStatsService {
	constructor(private readonly savedItemService: SavedItemService) {}

	async getStats(userId: string) {
		const now = dayjs();
		const startOfMonth = now.startOf('month').toDate();
		const startOfWeek = now.startOf('week').toDate();

		const [readAllTime, readMonth, readWeek, totalSaved, unreadItems] = await Promise.all([
			this.savedItemService.getMany(userId, {
				where: { readAt: { not: null } },
				select: { wordCount: true, readAt: true, createdAt: true },
			}),
			this.savedItemService.count(userId, {
				where: { readAt: { gte: startOfMonth } },
			}),
			this.savedItemService.count(userId, {
				where: { readAt: { gte: startOfWeek } },
			}),
			this.savedItemService.aggregate(userId, {
				_avg: { wordCount: true },
				_count: true,
			}),
			this.savedItemService.count(userId, { where: { readAt: null } }),
		]);

		const totalWordsRead = readAllTime.reduce((acc, item) => acc + (item.wordCount || 0), 0);
		const estimatedReadingTimeCompleted = totalWordsRead / 240;

		const timesToFinish = readAllTime
			.filter((item) => item.readAt && item.createdAt)
			.map((item) => dayjs(item.readAt).diff(dayjs(item.createdAt), 'day', true));

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
}
