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
import { InboundEmailAddressModule } from '../../modules/inbound-email-address/inbound-email-address.module';
import { PrismaService } from '../../services/prisma.service';
import { SavedItemManagerProcessor } from './saved-item-manager.processor';
import { SavedItemManagerResolver } from './saved-item-manager.resolver';

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
		PrismaService,
		SavedItemManagerProcessor,
		SavedItemManagerResolver,
	],
	controllers: [SavedItemManagerController],
	exports: [SavedItemManagerService],
})
export class SavedItemManagerModule {}
