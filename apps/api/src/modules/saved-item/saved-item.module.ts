import { Module } from '@nestjs/common';

import { SavedItemService } from './saved-item.service';
import { PrismaService } from 'src/services/prisma.service';
import { SavedItemResolver } from './saved-item.resolver';
import { ArticleModule } from './entities/article/article.module';
import { LabelModule } from './entities/label/label.module';
import { NewsletterModule } from './entities/newsletter/newsletter.module';
import { HighlightModule } from '../highlight/highlight.module';

@Module({
	imports: [ArticleModule, LabelModule, NewsletterModule, HighlightModule],
	providers: [SavedItemService, PrismaService, SavedItemResolver],
	exports: [SavedItemService],
})
export class SavedItemModule {}
