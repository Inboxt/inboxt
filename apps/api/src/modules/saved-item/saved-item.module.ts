import { Module } from '@nestjs/common';

import { StorageModule } from '~modules/storage/storage.module';

import { ArticleModule } from './entities/article/article.module';
import { LabelModule } from './entities/label/label.module';
import { NewsletterModule } from './entities/newsletter/newsletter.module';
import { SavedItemResolver } from './saved-item.resolver';
import { SavedItemService } from './saved-item.service';

@Module({
	imports: [ArticleModule, LabelModule, NewsletterModule, StorageModule],
	providers: [SavedItemService, SavedItemResolver],
	exports: [SavedItemService],
})
export class SavedItemModule {}
