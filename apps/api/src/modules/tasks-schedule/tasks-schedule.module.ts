import { Module } from '@nestjs/common';

import { TaskSchedulerService } from './tasks-schedule.service';
import { PrismaService } from '../../services/prisma.service';
import { SavedItemModule } from '../saved-item/saved-item.module';

@Module({
	imports: [SavedItemModule],
	providers: [PrismaService, TaskSchedulerService],
})
export class TaskScheduleModule {}
