import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class ScheduleTasksService {
	constructor(@InjectQueue('schedule-tasks') private readonly scheduleTasksQueue: Queue) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteUnverifiedUsers() {
		return this.scheduleTasksQueue.add('delete-unverified-users', {});
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async permanentlyDeleteSavedItems() {
		return this.scheduleTasksQueue.add('permanently-delete-saved-items', {});
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async deleteExpiredUnsubscribedNewsletters() {
		return this.scheduleTasksQueue.add('delete-expired-unsubscribed-newsletters', {});
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async lastReminderForUnverifiedUsers() {
		return this.scheduleTasksQueue.add('last-reminder-for-unverified-users', {});
	}
}
