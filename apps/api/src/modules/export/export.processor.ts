import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import dayjs from 'dayjs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { EMAIL_EXPORT_READY } from '~common/constants/email.constants';
import { LogExecutionTime } from '~common/decorators/log-execution-time.decorator';
import { ExportHighlightsFormat } from '~common/enums/export-highlights-format.enum';
import { BaseQueueProcessor } from '~common/processors/base-queue.processor';
import { Config } from '~config/index';
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
		private readonly configService: ConfigService<Config>,
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
		const filename = `inboxt_export_${timestamp}.zip`;
		const key = `exports/${data.userId}/${filename}`;

		const zip = await this.exportService.buildZipForAll({
			userId: data.userId,
			formatForHighlights: data.formatForHighlights,
		});

		let url: string;

		if (this.s3StorageService.isConfigured()) {
			await this.s3StorageService.upload({
				key,
				body: zip,
				contentType: 'application/zip',
				acl: 'private',
			});

			url = await this.s3StorageService.getSignedDownloadUrl(key);
		} else {
			const exportsConfig = this.configService.getOrThrow('exports', { infer: true });
			const userExportDir = join(exportsConfig.localPath, data.userId);
			const fullPath = join(userExportDir, filename);

			await mkdir(userExportDir, { recursive: true });
			await writeFile(fullPath, zip);

			const appUrl = this.configService.getOrThrow('appUrl', { infer: true });
			url = `${appUrl}/api/exports/${data.userId}/${filename}`;
		}

		await this.mail.sendTemplate({
			to: data.email,
			subject: EMAIL_EXPORT_READY.subject,
			template: exportReadyTemplate,
			templateData: { downloadUrl: url },
		});

		this.logger.log(`Export ready for user ${data.userId}: ${url}`);
		return { key, url };
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
