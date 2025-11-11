import { Module } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { LabelModule } from '../saved-item/entities/label/label.module';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
import { BullModule } from '@nestjs/bullmq';
import { ImportController } from './import.controller';
import { UserModule } from '../user/user.module';
import { SavedItemManagerModule } from '../../managers/saved-item-manager/saved-item-manager.module';
import { ContentExtractionService } from '../../services/content-extraction.service';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'import',
			defaultJobOptions: {
				removeOnComplete: true,
				removeOnFail: 50,
				attempts: 2,
				backoff: { type: 'exponential', delay: 60000 },
			},
		}),
		LabelModule,
		UserModule,
		SavedItemManagerModule,
	],
	providers: [ImportService, PrismaService, ImportProcessor, ContentExtractionService],
	controllers: [ImportController],
	exports: [ImportService],
})
export class ImportModule {}
