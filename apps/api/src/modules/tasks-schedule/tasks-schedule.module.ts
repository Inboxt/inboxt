import { Module } from '@nestjs/common';

import { TaskSchedulerService } from './tasks-schedule.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
	providers: [PrismaService, TaskSchedulerService],
})
export class TaskScheduleModule {}
