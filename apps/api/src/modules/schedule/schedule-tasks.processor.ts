import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor } from '@nestjs/bullmq';
import dayjs from 'dayjs';
import { PrismaService } from '../../services/prisma.service';
import { SavedItemManagerService } from '../../managers/saved-item-manager/saved-item-manager.service';
import { BaseQueueProcessor } from '../../common/processors/base-queue.processor';
import { LogExecutionTime } from '../../decorators/log-execution-time.decorator';
import { MailService } from '../mail/mail.service';
import {
	EMAIL_ACCOUNT_DELETED,
	EMAIL_VERIFY_REMINDER,
} from '../../common/constants/email.constants';
import { accountDeletedTemplate } from '../../mail-templates/accountDeletedTemplate';
import { verifyEmailReminderTemplate } from '../../mail-templates/verifyEmailReminderTemplate';

@Processor('schedule-tasks', { concurrency: 10 })
export class ScheduleTasksProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(ScheduleTasksProcessor.name);
	constructor(
		private prisma: PrismaService,
		private savedItemManagerService: SavedItemManagerService,
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
			case 'reset-demo-account':
				return this.resetDemoAccount();
			case 'delete-expired-unsubscribed-newsletters':
				return this.deleteExpiredUnsubscribedNewsletters();
			case 'last-reminder-for-unverified-users':
				return this.lastReminderForUnverifiedUsers();
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
						timestamp: dayjs().format('dddd, MMMM D, YYYY, HH:mm'),
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
}
