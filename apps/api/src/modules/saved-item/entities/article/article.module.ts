import { Module } from '@nestjs/common';

import { StorageModule } from '~modules/storage/storage.module';
import { ContentExtractionService } from '~services/content-extraction.service';

import { ArticleService } from './article.service';

@Module({
	imports: [StorageModule],
	providers: [ArticleService, ContentExtractionService],
	exports: [ArticleService],
})
export class ArticleModule {}
