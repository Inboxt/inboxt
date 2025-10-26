import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { PrismaService } from '../../../../services/prisma.service';
import { ContentExtractionService } from '../../../../services/content-extraction.service';

@Module({
	providers: [PrismaService, ArticleService, ContentExtractionService],
	exports: [ArticleService],
})
export class ArticleModule {}
