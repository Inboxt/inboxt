import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class TaskSchedulerService {
	private readonly logger = new Logger(TaskSchedulerService.name);

	constructor(private prisma: PrismaService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteUnverifiedUsers() {
		const thresholdDate = dayjs().subtract(45, 'days').toDate();
		const users = await this.prisma.user.findMany({
			where: {
				isEmailVerified: false,
				createdAt: {
					lte: thresholdDate,
				},
			},
		});

		await Promise.all(
			users.map((user) =>
				this.prisma.user.delete({
					where: { id: user.id, emailAddress: user.emailAddress },
				}),
			),
		);

		this.logger.log(`Deleted ${users.length} unverified users older than 45 days`);
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async permanentlyDeleteSavedItems() {
		const thresholdDate = dayjs().subtract(30, 'days').toDate();
		const savedItems = await this.prisma.saved_item.findMany({
			where: {
				deletedSince: {
					lte: thresholdDate,
				},
			},
		});

		await Promise.all(
			savedItems.map((savedItem) =>
				this.prisma.saved_item.delete({ where: { id: savedItem.id } }),
			),
		);

		this.logger.log(
			`Deleted ${savedItems.length} saved items that were soft deleted more than 30 days ago`,
		);
	}
}
