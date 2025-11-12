import { Module } from '@nestjs/common';

import { ExportService } from './export.service';
import { ExportResolver } from './export.resolver';
import { HighlightModule } from '../highlight/highlight.module';
import { SavedItemModule } from '../saved-item/saved-item.module';
import { UserModule } from '../user/user.module';
import { InboundEmailAddressModule } from '../inbound-email-address/inbound-email-address.module';
import { LabelModule } from '../saved-item/entities/label/label.module';
import { NewsletterModule } from '../saved-item/entities/newsletter/newsletter.module';
import { BullModule } from '@nestjs/bullmq';
import { ExportProcessor } from './export.processor';
import { MailModule } from '../mail/mail.module';
import { StorageModule } from '../storage/storage.module';

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
