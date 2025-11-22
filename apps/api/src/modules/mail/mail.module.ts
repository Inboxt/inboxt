import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
	providers: [
		MailService,
		MailProcessor,
		{
			provide: 'MAIL_TRANSPORTER',
			useFactory: (configService: ConfigService) => {
				return nodemailer.createTransport({
					host: configService.get('MAIL_HOST'),
					port: parseInt(configService.get('MAIL_PORT') as string, 10),
				});
			},
			inject: [ConfigService],
		},
	],
	exports: [MailService],
})
export class MailModule {}
