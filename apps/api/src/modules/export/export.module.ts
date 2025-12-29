import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { HighlightModule } from '~modules/highlight/highlight.module';
import { InboundEmailAddressModule } from '~modules/inbound-email-address/inbound-email-address.module';
import { MailModule } from '~modules/mail/mail.module';
import { LabelModule } from '~modules/saved-item/entities/label/label.module';
import { NewsletterModule } from '~modules/saved-item/entities/newsletter/newsletter.module';
import { SavedItemModule } from '~modules/saved-item/saved-item.module';
import { StorageModule } from '~modules/storage/storage.module';
import { UserModule } from '~modules/user/user.module';

import { ExportProcessor } from './export.processor';
import { ExportResolver } from './export.resolver';
import { ExportService } from './export.service';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'export',
			defaultJobOptions: {
				removeOnComplete: true,
				removeOnFail: 50,
				attempts: 2,
				backoff: { type: 'exponential', delay: 60000 },
			},
		}),
		HighlightModule,
		SavedItemModule,
		UserModule,
		InboundEmailAddressModule,
		LabelModule,
		NewsletterModule,
		MailModule,
		StorageModule,
	],
	providers: [ExportService, ExportResolver, ExportProcessor],
	exports: [ExportService],
})
export class ExportModule {}
