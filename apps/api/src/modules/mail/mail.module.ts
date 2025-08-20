import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'mail',
			defaultJobOptions: {
				removeOnComplete: 100,
				removeOnFail: 50,
				attempts: 3,
				backoff: { type: 'exponential', delay: 60000 },
			},
		}),
	],
	providers: [MailService, MailProcessor],
	exports: [MailService],
})
export class MailModule {}
