import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'mail',
			defaultJobOptions: {
				removeOnComplete: true,
				removeOnFail: true,
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
