import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { Config } from '~config/index';
import { ContentExtractionService } from '~services/content-extraction.service';

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
		ContentExtractionService,
		{
			provide: 'MAIL_TRANSPORTER',
			useFactory: (configService: ConfigService<Config>) => {
				const mailConfig = configService.get('mail', { infer: true });
				if (!mailConfig) {
					return null;
				}

				return nodemailer.createTransport({
					host: mailConfig.host,
					port: mailConfig.port,
					secure: mailConfig.secure,
					auth: mailConfig.auth,
				});
			},
			inject: [ConfigService],
		},
	],
	exports: [MailService],
})
export class MailModule {}
