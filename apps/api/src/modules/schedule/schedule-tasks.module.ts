import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { MailModule } from '~modules/mail/mail.module';

import { ScheduleTasksProcessor } from './schedule-tasks.processor';
import { ScheduleTasksService } from './schedule-tasks.service';

@Module({
	imports: [
		MailModule,
		BullModule.registerQueue({
			name: 'schedule-tasks',
			defaultJobOptions: {
				removeOnComplete: true,
				removeOnFail: 50,
				attempts: 2,
				backoff: { type: 'exponential', delay: 60000 },
			},
		}),
	],
	providers: [ScheduleTasksService, ScheduleTasksProcessor],
})
export class ScheduleTasksModule {}
