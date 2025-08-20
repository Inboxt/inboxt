import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { SavedItemManagerService } from './saved-item-manager.service';
import { SavedItemModule } from '../../modules/saved-item/saved-item.module';
import { NewsletterModule } from '../../modules/saved-item/entities/newsletter/newsletter.module';
import { LabelModule } from '../../modules/saved-item/entities/label/label.module';
import { ArticleModule } from '../../modules/saved-item/entities/article/article.module';
import { UserModule } from '../../modules/user/user.module';
import { SavedItemManagerController } from './saved-item-manager.controller';
import { MailModule } from '../../modules/mail/mail.module';
import { SavedItemArticleProcessor } from './processors/saved-item-article.processor';
import { SavedItemNewsletterProcessor } from './processors/saved-item-newsletter.processor';

@Module({
	imports: [
		SavedItemModule,
		ArticleModule,
		LabelModule,
		NewsletterModule,
		UserModule,
		MailModule,
		BullModule.registerQueue({
			name: 'article-processing',
			defaultJobOptions: {
				removeOnComplete: 100,
				removeOnFail: 50,
				attempts: 3,
				backoff: { type: 'exponential', delay: 30000 },
			},
		}),
		BullModule.registerQueue({
			name: 'newsletter-processing',
			defaultJobOptions: {
				removeOnComplete: 100,
				removeOnFail: 50,
				attempts: 2,
				backoff: { type: 'fixed', delay: 30000 },
			},
		}),
	],
	providers: [SavedItemManagerService, SavedItemArticleProcessor, SavedItemNewsletterProcessor],
	controllers: [SavedItemManagerController],
	exports: [SavedItemManagerService],
})
export class SavedItemManagerModule {}
