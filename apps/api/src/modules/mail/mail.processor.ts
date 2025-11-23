import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Transporter } from 'nodemailer';

import { BaseQueueProcessor } from '../../common/processors/base-queue.processor';
import { LogExecutionTime } from '../../decorators/log-execution-time.decorator';
import Mail from 'nodemailer/lib/mailer';

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
			from: '"Inboxt" <no-reply@inboxt.app>',
			...mailOptions,
		});
	}
}
