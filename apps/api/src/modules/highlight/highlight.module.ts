import { Module } from '@nestjs/common';

import { SavedItemHighlightsResolver } from '~modules/highlight/saved-item-highlights.resolver';
import { SavedItemModule } from '~modules/saved-item/saved-item.module';

import { HighlightResolver } from './highlight.resolver';
import { HighlightService } from './highlight.service';

@Module({
	imports: [SavedItemModule],
	providers: [HighlightService, HighlightResolver, SavedItemHighlightsResolver],
	exports: [HighlightService],
})
export class HighlightModule {}
