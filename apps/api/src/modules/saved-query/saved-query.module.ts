import { Module } from '@nestjs/common';

import { SavedQueryResolver } from './saved-query.resolver';
import { SavedQueryService } from './saved-query.service';

@Module({
	providers: [SavedQueryService, SavedQueryResolver],
	exports: [SavedQueryService],
})
export class SavedQueryModule {}
