import { Module } from '@nestjs/common';

import { HighlightModule } from '../../modules/highlight/highlight.module';
import { SavedItemModule } from '../../modules/saved-item/saved-item.module';
import { EntryManagerService } from './entry-manager.service';
import { EntryManagerResolver } from './entry-manager.resolver';

@Module({
	imports: [SavedItemModule, HighlightModule],
	providers: [EntryManagerService, EntryManagerResolver],
	exports: [EntryManagerService],
})
export class EntryManagerModule {}
