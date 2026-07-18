import { Module } from '@nestjs/common';

import { SavedItemModule } from '~modules/saved-item/saved-item.module';

import { UserStatsService } from './user-stats.service';

@Module({
	imports: [SavedItemModule],
	providers: [UserStatsService],
	exports: [UserStatsService],
})
export class UserStatsModule {}
