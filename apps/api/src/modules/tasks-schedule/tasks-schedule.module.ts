import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { SavedItemModule } from '../saved-item/saved-item.module';
import { TaskSchedulerService } from './tasks-schedule.service';

@Module({
	imports: [UserModule, SavedItemModule],
	providers: [TaskSchedulerService],
})
export class TaskScheduleModule {}
