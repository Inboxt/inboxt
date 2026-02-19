import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { LogExecutionTime } from '~common/decorators/log-execution-time.decorator';
import { BaseQueueProcessor } from '~common/processors/base-queue.processor';
import { Config } from '~config/index';

@Processor('mail', { concurrency: 5 })
export class MailProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(MailProcessor.name);
	constructor(
		@Inject('MAIL_TRANSPORTER') private readonly transporter: Transporter | null,
		private readonly configService: ConfigService<Config>,
	) {
		super();
	}

	async process(job: Job<Mail.Options, void, 'send'>): Promise<void> {
		switch (job.name) {
			case 'send':
				return this.sendEmail(job.data);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async sendEmail(mailOptions: Mail.Options) {
		const appUrl = this.configService.getOrThrow('appUrl', { infer: true });

		const domain = new URL(appUrl).hostname;
		const from = `"Inboxt" <no-reply@${domain}>`;

		if (!this.transporter) {
			this.logger.warn(`SMTP is not configured. Email to ${mailOptions.to} was not sent.`);
			this.logger.debug(`Email content: ${JSON.stringify(mailOptions)}`);
			return;
		}

		await this.transporter.sendMail({
			from,
			...mailOptions,
		});
	}
}
