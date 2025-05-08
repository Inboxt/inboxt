import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

import { UserService } from '../user/user.service';

@Injectable()
export class TaskSchedulerService {
	private readonly logger = new Logger(TaskSchedulerService.name);

	constructor(private userService: UserService) {}

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

		this.logger.log(
			`Deleted ${users.length} unverified users older than 45 days`,
		);
	}
}
