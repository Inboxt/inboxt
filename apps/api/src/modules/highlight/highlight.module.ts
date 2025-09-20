import { Module } from '@nestjs/common';
import { HighlightService } from './highlight.service';
import { HighlightResolver } from './highlight.resolver';
import { PrismaService } from '../../services/prisma.service';
import { SavedItemHighlightsResolver } from './saved-item-highlights.resolver';
import { SavedItemModule } from '../saved-item/saved-item.module';

@Module({
	imports: [SavedItemModule],
	providers: [HighlightService, HighlightResolver, PrismaService, SavedItemHighlightsResolver],
	exports: [HighlightService],
})
export class HighlightModule {}
