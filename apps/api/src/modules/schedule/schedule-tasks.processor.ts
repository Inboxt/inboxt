import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor } from '@nestjs/bullmq';
import dayjs from 'dayjs';
import { PrismaService } from '../../services/prisma.service';
import { SavedItemManagerService } from '../../managers/saved-item-manager/saved-item-manager.service';
import { BaseQueueProcessor } from '../../common/processors/base-queue.processor';
import { LogExecutionTime } from '../../decorators/log-execution-time.decorator';

@Processor('schedule-tasks', { concurrency: 10 })
export class ScheduleTasksProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(ScheduleTasksProcessor.name);
	constructor(
		private prisma: PrismaService,
		private savedItemManagerService: SavedItemManagerService,
	) {
		super();
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'delete-unverified-users':
				return this.deleteUnverifiedUsers();
			case 'permanently-delete-saved-items':
				return this.permanentlyDeleteSavedItems();
			case 'reset-demo-account':
				return this.resetDemoAccount();
			case 'delete-expired-unsubscribed-newsletters':
				return this.deleteExpiredUnsubscribedNewsletters();
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async deleteUnverifiedUsers() {
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

	@LogExecutionTime
	private async permanentlyDeleteSavedItems() {
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

	@LogExecutionTime
	private async resetDemoAccount() {
		const demoEmail = 'demo@inbox-reader.com'; // todo: use user_plan rather that email address or a combination of both?
		const user = await this.prisma.user.findFirst({
			where: { emailAddress: demoEmail },
		});
		if (!user) {
			return;
		}

		await this.prisma.saved_item.deleteMany({ where: { user: { emailAddress: demoEmail } } });
		await this.prisma.label.deleteMany({ where: { user: { emailAddress: demoEmail } } });

		// todo: default user account settings? like firstName/lastName?
		await this.savedItemManagerService.createDefaultItems(user.id);

		this.logger.log(`Demo account reset at ${new Date().toISOString()}`);
	}

	@LogExecutionTime
	private async deleteExpiredUnsubscribedNewsletters() {
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
