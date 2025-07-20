import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

import { UserService } from '../user/user.service';
import { SavedItemService } from '../saved-item/saved-item.service';

@Injectable()
export class TaskSchedulerService {
	private readonly logger = new Logger(TaskSchedulerService.name);

	constructor(
		private userService: UserService,
		private savedItemService: SavedItemService,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteUnverifiedUsers() {
		const thresholdDate = dayjs().subtract(45, 'days').toDate();
		const users = await this.userService.getMany({
			where: {
				isEmailVerified: false,
				createdAt: {
					lte: thresholdDate,
				},
			},
		});

		await Promise.all(
			users.map(async (user) => {
				await this.userService.delete(user.id, {
					emailAddress: user.emailAddress,
				});
			}),
		);

		this.logger.log(`Deleted ${users.length} unverified users older than 45 days`);
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async permanentlyDeleteSavedItems() {
		const thresholdDate = dayjs().subtract(30, 'days').toDate();
		const savedItems = await this.savedItemService.getMany({
			where: {
				deletedSince: {
					lte: thresholdDate,
				},
			},
		});

		await Promise.all(
			savedItems.map((savedItem) => this.savedItemService.delete(savedItem.id)),
		);

		this.logger.log(
			`Deleted ${savedItems.length} saved items that were soft deleted more than 30 days ago`,
		);
	}
}
