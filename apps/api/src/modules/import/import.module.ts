import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { SavedItemManagerModule } from '~managers/saved-item-manager/saved-item-manager.module';
import { LabelModule } from '~modules/saved-item/entities/label/label.module';
import { UserModule } from '~modules/user/user.module';
import { ContentExtractionService } from '~services/content-extraction.service';

import { ImportController } from './import.controller';
import { ImportProcessor } from './import.processor';
import { ImportService } from './import.service';

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
	providers: [ImportService, ImportProcessor, ContentExtractionService],
	controllers: [ImportController],
	exports: [ImportService],
})
export class ImportModule {}
