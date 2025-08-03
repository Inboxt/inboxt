import { Module } from '@nestjs/common';

import { TaskSchedulerService } from './tasks-schedule.service';
import { PrismaService } from '../../services/prisma.service';
import { SavedItemManagerModule } from '../../managers/saved-item-manager/saved-item-manager.module';

@Module({
	imports: [SavedItemManagerModule],
	providers: [PrismaService, TaskSchedulerService],
})
export class TaskScheduleModule {}
