import { Module } from '@nestjs/common';
import { PrismaService } from '../../../../services/prisma.service';
import { LabelService } from './label.service';
import { LabelResolver } from './label.resolver';

@Module({
	providers: [PrismaService, LabelService, LabelResolver],
	exports: [LabelService],
})
export class LabelModule {}
