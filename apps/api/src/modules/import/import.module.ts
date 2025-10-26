import { Module } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { MailModule } from '../mail/mail.module';
import { SavedItemModule } from '../saved-item/saved-item.module';
import { LabelModule } from '../saved-item/entities/label/label.module';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
import { BullModule } from '@nestjs/bullmq';
import { ImportController } from './import.controller';
import { UserModule } from '../user/user.module';
import { SavedItemManagerModule } from '../../managers/saved-item-manager/saved-item-manager.module';
import { NewsletterModule } from '../saved-item/entities/newsletter/newsletter.module';
import { ArticleModule } from '../saved-item/entities/article/article.module';
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
		MailModule,
		SavedItemModule,
		LabelModule,
		UserModule,
		SavedItemManagerModule,
		NewsletterModule,
		ArticleModule,
	],
	providers: [ImportService, PrismaService, ImportProcessor, ContentExtractionService],
	controllers: [ImportController],
	exports: [ImportService],
})
export class ImportModule {}
