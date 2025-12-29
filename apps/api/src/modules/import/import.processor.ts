import { Processor, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { promises as fs } from 'fs';

import { LogExecutionTime } from '~common/decorators/log-execution-time.decorator';
import { BaseQueueProcessor } from '~common/processors/base-queue.processor';

import { ImportService } from './import.service';

@Processor('import', { concurrency: 2, limiter: { max: 5, duration: 1000 } })
export class ImportProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(ImportProcessor.name);
	constructor(private readonly importService: ImportService) {
		super();
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'import-csv':
				return this.importCsvFile(
					job.data as {
						userId: string;
						filePath: string;
						originalName: string;
					},
				);
			case 'import-app-export':
				return this.importZipArchive(
					job.data as {
						userId: string;
						filePath: string;
						originalName: string;
					},
				);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@OnWorkerEvent('completed')
	async onCompleted(job: Job) {
		await this.cleanupFile(job.data.filePath);
	}

	@OnWorkerEvent('failed')
	async onFailed(job: Job) {
		if (job.attemptsMade >= (job.opts.attempts || 1)) {
			await this.cleanupFile(job.data.filePath);
		}
	}

	private async cleanupFile(filePath: string) {
		try {
			await fs.unlink(filePath);
			this.logger.log(`Cleaned up file: ${filePath}`);
		} catch (error) {
			this.logger.warn(`Failed to cleanup file ${filePath}: ${error}`);
		}
	}

	@LogExecutionTime
	private importCsvFile(data: { userId: string; filePath: string; originalName: string }) {
		return this.importService.importCsvFile(data);
	}

	@LogExecutionTime
	private importZipArchive(data: { userId: string; filePath: string; originalName: string }) {
		return this.importService.importZipArchive(data);
	}
}
