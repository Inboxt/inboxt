import { Module } from '@nestjs/common';
import { HighlightService } from './highlight.service';
import { HighlightResolver } from './highlight.resolver';
import { PrismaService } from '../../services/prisma.service';

@Module({
	providers: [HighlightService, HighlightResolver, PrismaService],
	exports: [HighlightService],
})
export class HighlightModule {}
