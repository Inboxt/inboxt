import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { PrismaService } from '../../../../services/prisma.service';

@Module({
	providers: [PrismaService, ArticleService],
	exports: [ArticleService],
})
export class ArticleModule {}
