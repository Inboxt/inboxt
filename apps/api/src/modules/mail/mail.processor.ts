import { MailerService } from '@nestjs-modules/mailer';
import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { BaseQueueProcessor } from '../../common/processors/base-queue.processor';
import { LogExecutionTime } from '../../decorators/log-execution-time.decorator';

@Processor('mail', { concurrency: 5 })
export class MailProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(MailProcessor.name);
	constructor(private readonly mailerService: MailerService) {
		super();
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'send':
				return this.sendEmail(job.data);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async sendEmail(mailOptions: any) {
		await this.mailerService.sendMail({
			from: '"Inbox Reader" <no-reply@inbox-reader.com>',
			...mailOptions,
		});
	}
}
