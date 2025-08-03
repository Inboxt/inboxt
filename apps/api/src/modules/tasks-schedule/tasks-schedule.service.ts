import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

import { PrismaService } from '../../services/prisma.service';
import { SavedItemManagerService } from '../../managers/saved-item-manager/saved-item-manager.service';

@Injectable()
export class TaskSchedulerService {
	private readonly logger = new Logger(TaskSchedulerService.name);

	constructor(
		private prisma: PrismaService,
		private savedItemManagerService: SavedItemManagerService,
	) {}

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

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async resetDemoAccount() {
		const demoEmail = 'demo@inbox-reader.com'; // todo: use user_plan rather that email address or a combination of both?
		const user = await this.prisma.user.findFirst({ where: { emailAddress: demoEmail } });
		if (!user) {
			return;
		}

		// Clean-up
		await this.prisma.saved_item.deleteMany({ where: { user: { emailAddress: demoEmail } } });
		await this.prisma.label.deleteMany({ where: { user: { emailAddress: demoEmail } } });

		// Default values
		// todo: default user account settings? like firstName/lastName?
		await this.savedItemManagerService.createDefaultItems(user.id);

		this.logger.log(`Demo account reset at ${new Date().toISOString()}`);
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteExpiredUnsubscribedNewsletters() {
		const thresholdDate = dayjs().subtract(90, 'days').toDate();
		const expiredSubscriptions = await this.prisma.newsletter_subscription.findMany({
			where: {
				status: 'UNSUBSCRIBED',
				unsubscribeAttemptedAt: { lte: thresholdDate },
			},
		});

		await Promise.all(
			expiredSubscriptions.map((subscription) =>
				this.prisma.newsletter_subscription.delete({ where: { id: subscription.id } }),
			),
		);

		this.logger.log(
			`Deleted ${expiredSubscriptions.length} unsubscribed newsletter subscriptions older than 90 days`,
		);
	}
}
