import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PrismaService } from '../../services/prisma.service';
import { SavedItemManagerModule } from '../../managers/saved-item-manager/saved-item-manager.module';
import { ScheduleTasksProcessor } from './schedule-tasks.processor';
import { ScheduleTasksService } from './schedule-tasks.service';
import { MailModule } from '../mail/mail.module';

@Module({
	imports: [
		MailModule,
		SavedItemManagerModule,
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
	providers: [PrismaService, ScheduleTasksService, ScheduleTasksProcessor],
})
export class ScheduleTasksModule {}
