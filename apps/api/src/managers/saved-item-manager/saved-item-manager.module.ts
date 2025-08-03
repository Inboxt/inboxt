import { Module } from '@nestjs/common';

import { SavedItemManagerService } from './saved-item-manager.service';
import { SavedItemModule } from '../../modules/saved-item/saved-item.module';
import { NewsletterModule } from '../../modules/saved-item/entities/newsletter/newsletter.module';
import { LabelModule } from '../../modules/saved-item/entities/label/label.module';
import { ArticleModule } from '../../modules/saved-item/entities/article/article.module';
import { UserModule } from '../../modules/user/user.module';
import { SavedItemManagerController } from './saved-item-manager.controller';
import { MailModule } from '../../modules/mail/mail.module';

@Module({
	imports: [
		SavedItemModule,
		ArticleModule,
		LabelModule,
		NewsletterModule,
		UserModule,
		MailModule,
	],
	providers: [SavedItemManagerService],
	controllers: [SavedItemManagerController],
	exports: [SavedItemManagerService],
})
export class SavedItemManagerModule {}
