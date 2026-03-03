import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { WebhookSecretGuard } from '~common/guards/webhook-secret.guard';
import { InboundEmailAddressModule } from '~modules/inbound-email-address/inbound-email-address.module';
import { MailModule } from '~modules/mail/mail.module';
import { ArticleModule } from '~modules/saved-item/entities/article/article.module';
import { LabelModule } from '~modules/saved-item/entities/label/label.module';
import { NewsletterModule } from '~modules/saved-item/entities/newsletter/newsletter.module';
import { SavedItemModule } from '~modules/saved-item/saved-item.module';
import { UserModule } from '~modules/user/user.module';

import { SavedItemManagerController } from './saved-item-manager.controller';
import { SavedItemManagerProcessor } from './saved-item-manager.processor';
import { SavedItemManagerResolver } from './saved-item-manager.resolver';
import { SavedItemManagerService } from './saved-item-manager.service';

@Module({
	imports: [
		SavedItemModule,
		ArticleModule,
		LabelModule,
		NewsletterModule,
		UserModule,
		MailModule,
		InboundEmailAddressModule,
		NewsletterModule,
		BullModule.registerQueue({
			name: 'saved-item-processing',
		}),
	],
	providers: [
		SavedItemManagerService,
		SavedItemManagerProcessor,
		SavedItemManagerResolver,
		WebhookSecretGuard,
	],
	controllers: [SavedItemManagerController],
	exports: [SavedItemManagerService],
})
export class SavedItemManagerModule {}
