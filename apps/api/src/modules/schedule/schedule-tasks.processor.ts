import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor } from '@nestjs/bullmq';
import dayjs from 'dayjs';
import { PrismaService } from '../../services/prisma.service';
import { BaseQueueProcessor } from '../../common/processors/base-queue.processor';
import { LogExecutionTime } from '../../decorators/log-execution-time.decorator';
import { MailService } from '../mail/mail.service';
import {
	EMAIL_ACCOUNT_DELETED,
	EMAIL_STORAGE_APPROACHING_LIMIT,
	EMAIL_STORAGE_LIMIT_REACHED,
	EMAIL_VERIFY_REMINDER,
} from '../../common/constants/email.constants';
import { accountDeletedTemplate } from '../../mail-templates/accountDeletedTemplate';
import { verifyEmailReminderTemplate } from '../../mail-templates/verifyEmailReminderTemplate';
import { UserPlan } from '../../enums/user-plan.enum';
import { storageThresholdTemplate } from '../../mail-templates/storageThresholdTemplate';

@Processor('schedule-tasks', { concurrency: 10 })
export class ScheduleTasksProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(ScheduleTasksProcessor.name);
	constructor(
		private prisma: PrismaService,
		private mailService: MailService,
	) {
		super();
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'delete-unverified-users':
				return this.deleteUnverifiedUsers();
			case 'permanently-delete-saved-items':
				return this.permanentlyDeleteSavedItems();
			case 'delete-expired-demo-accounts':
				return this.deleteExpiredDemoAccounts();
			case 'delete-expired-unsubscribed-newsletters':
				return this.deleteExpiredUnsubscribedNewsletters();
			case 'last-reminder-for-unverified-users':
				return this.lastReminderForUnverifiedUsers();
			case 'reconcile-storage-usage':
				return this.reconcileStorageUsage();
			case 'notify-storage-thresholds':
				return this.notifyStorageThresholds();
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
			users.map(async (user) => {
				await this.prisma.user.delete({
					where: { id: user.id, emailAddress: user.emailAddress },
				});

				await this.mailService.sendTemplate({
					subject: EMAIL_ACCOUNT_DELETED.subject,
					template: accountDeletedTemplate,
					templateData: {
						timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm [UTC]'),
					},
					to: user.emailAddress,
				});
			}),
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
	private async deleteExpiredDemoAccounts() {
		const cutoff = dayjs().subtract(24, 'hour').toDate();
		const expiredDemoUsers = await this.prisma.user.findMany({
			where: {
				plan: UserPlan.DEMO,
				createdAt: { lte: cutoff },
			},
			select: { id: true, emailAddress: true },
		});

		if (!expiredDemoUsers.length) {
			this.logger.log('No expired demo accounts to delete');
			return;
		}

		const userIds = expiredDemoUsers.map((u) => u.id);
		await this.prisma.user.deleteMany({ where: { id: { in: userIds } } });

		this.logger.log(
			`Deleted ${userIds.length} expired demo accounts at ${new Date().toISOString()}`,
		);
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

	@LogExecutionTime
	private async lastReminderForUnverifiedUsers() {
		const lowerBound = dayjs().subtract(41, 'days').toDate();
		const upperBound = dayjs().subtract(40, 'days').toDate();

		const users = await this.prisma.user.findMany({
			where: {
				isEmailVerified: false,
				createdAt: {
					gt: lowerBound,
					lte: upperBound,
				},
			},
		});

		for (const user of users) {
			const daysRemaining = 45 - dayjs().diff(dayjs(user.createdAt), 'day');
			await this.mailService.sendTemplate({
				template: verifyEmailReminderTemplate,
				templateData: { daysRemaining },
				to: user.emailAddress,
				subject: EMAIL_VERIFY_REMINDER.subject,
			});
		}

		this.logger.log(`Sent reminder emails to ${users.length} unverified users`);
	}

	@LogExecutionTime
	private async reconcileStorageUsage() {
		const pageSize = 250;
		let corrected = 0;
		let scanned = 0;

		while (true) {
			const users = await this.prisma.user.findMany({
				select: { id: true, storageUsageBytes: true },
				orderBy: { id: 'asc' },
				take: pageSize,
				skip: scanned,
			});

			if (!users.length) break;

			for (const u of users) {
				const [savedItemAgg, articleAgg, newsletterAgg, highlightAgg] = await Promise.all([
					this.prisma.saved_item.aggregate({
						where: { userId: u.id },
						_sum: { sizeBytes: true },
					}),
					this.prisma.article.aggregate({
						where: { saved_item: { userId: u.id } },
						_sum: { sizeBytes: true },
					}),
					this.prisma.newsletter.aggregate({
						where: { saved_item: { userId: u.id } },
						_sum: { sizeBytes: true },
					}),
					this.prisma.highlight_segment.aggregate({
						where: { highlight: { userId: u.id } },
						_sum: { sizeBytes: true },
					}),
				]);

				const actual =
					(savedItemAgg._sum.sizeBytes ?? 0n) +
					(articleAgg._sum.sizeBytes ?? 0n) +
					(newsletterAgg._sum.sizeBytes ?? 0n) +
					(highlightAgg._sum.sizeBytes ?? 0n);

				const stored = u.storageUsageBytes;

				if (actual !== stored) {
					await this.prisma.user.update({
						where: { id: u.id },
						data: { storageUsageBytes: actual },
					});

					corrected++;
					this.logger.warn(
						`Reconciled storage for user ${u.id}: stored:${stored}, actual:${actual}`,
					);
				}
			}

			scanned += users.length;
			if (users.length < pageSize) break;
		}

		this.logger.log(`Reconcile storage usage done. scanned:${scanned}, corrected:${corrected}`);
	}

	private async notifyStorageThresholds() {
		const thresholds = [80, 100]; // should be sorted from low to high
		const pageSize = 250;
		let scanned = 0;
		let sent = 0;

		while (true) {
			const users = await this.prisma.user.findMany({
				orderBy: { id: 'asc' },
				take: pageSize,
				skip: scanned,
			});
			if (!users.length) break;

			for (const u of users) {
				const quota = u.storageQuotaBytes;
				if (quota <= 0n) continue;

				const usage = u.storageUsageBytes;
				const percent = Number((usage * 100n) / quota);

				if (u.lastNotifiedStorageThreshold && percent < thresholds[0]) {
					await this.prisma.user.update({
						where: { id: u.id },
						data: { lastNotifiedStorageThreshold: 0 },
					});
					u.lastNotifiedStorageThreshold = 0;
				}

				const crossed = thresholds.filter((t) => percent >= t).sort((a, b) => b - a)[0];
				if (!crossed) continue;

				if (u.lastNotifiedStorageThreshold >= crossed) continue;

				const isExceeded = crossed >= 100;

				await this.mailService.sendTemplate({
					to: u.emailAddress,
					subject: isExceeded
						? EMAIL_STORAGE_LIMIT_REACHED.subject
						: EMAIL_STORAGE_APPROACHING_LIMIT.subject,
					template: storageThresholdTemplate,
					templateData: {
						usageBytes: usage,
						quotaBytes: quota,
						isExceeded,
					},
				});

				await this.prisma.user.update({
					where: { id: u.id },
					data: { lastNotifiedStorageThreshold: crossed },
				});

				sent++;
			}

			scanned += users.length;
			if (users.length < pageSize) break;
		}

		this.logger.log(
			`notifyStorageThresholds finished. scanned=${scanned}, sent=${sent}, thresholds=[${thresholds.join(', ')}]`,
		);
	}
}
