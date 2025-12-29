import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import dayjs from 'dayjs';

import { EMAIL_EXPORT_READY } from '~common/constants/email.constants';
import { LogExecutionTime } from '~common/decorators/log-execution-time.decorator';
import { ExportHighlightsFormat } from '~common/enums/export-highlights-format.enum';
import { BaseQueueProcessor } from '~common/processors/base-queue.processor';
import { exportReadyTemplate } from '~mail-templates/exportReadyTemplate';
import { MailService } from '~modules/mail/mail.service';
import { S3StorageService } from '~modules/storage/s3-storage.service';
import { UserService } from '~modules/user/user.service';

import { ExportService } from './export.service';

@Processor('export', { concurrency: 2 })
export class ExportProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(ExportProcessor.name);
	constructor(
		private readonly exportService: ExportService,
		private readonly s3StorageService: S3StorageService,
		private readonly mail: MailService,
		private readonly userService: UserService,
	) {
		super();
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'export-all-data':
				return this.handleExportAll(
					job.data as {
						userId: string;
						email: string;
						formatForHighlights: ExportHighlightsFormat;
					},
				);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async handleExportAll(data: {
		userId: string;
		email: string;
		formatForHighlights: ExportHighlightsFormat;
	}) {
		const timestamp = dayjs().format('YYYYMMDD_HHmmss');
		const key = `exports/${data.userId}/inboxt_export_${timestamp}.zip`;
		const zip = await this.exportService.buildZipForAll({
			userId: data.userId,
			formatForHighlights: data.formatForHighlights,
		});

		await this.s3StorageService.upload({
			key,
			body: zip,
			contentType: 'application/zip',
			acl: 'private',
		});

		const url = await this.s3StorageService.getSignedDownloadUrl(key);
		await this.mail.sendTemplate({
			to: data.email,
			subject: EMAIL_EXPORT_READY.subject,
			template: exportReadyTemplate,
			templateData: { downloadUrl: url },
		});

		this.logger.log(`Export ready for user ${data.userId}: ${key}`);
		return { key };
	}

	@OnWorkerEvent('failed')
	async onJobFailed(job: Job, error: Error) {
		const maxAttempts = job.opts.attempts ?? 1;
		const isFinalFailure = job.attemptsMade >= maxAttempts;

		if (isFinalFailure && job.data?.userId) {
			await this.userService.recordExportRequest(job.data.userId, null);
		}

		console.error(
			`Job ${job.id} failed (attempt ${job.attemptsMade}/${maxAttempts}): ${error.message}`,
		);
	}
}
