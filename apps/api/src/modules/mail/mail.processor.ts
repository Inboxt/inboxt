import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { LogExecutionTime } from '~common/decorators/log-execution-time.decorator';
import { BaseQueueProcessor } from '~common/processors/base-queue.processor';

@Processor('mail', { concurrency: 5 })
export class MailProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(MailProcessor.name);
	constructor(@Inject('MAIL_TRANSPORTER') private readonly transporter: Transporter) {
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
		await this.transporter.sendMail({
			from: '"Inboxt" <no-reply@mail.inboxt.app>',
			...mailOptions,
		});
	}
}
