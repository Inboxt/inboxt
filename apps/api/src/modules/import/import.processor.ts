import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { BaseQueueProcessor } from '../../common/processors/base-queue.processor';
import { ImportService } from './import.service';
import { LogExecutionTime } from '../../decorators/log-execution-time.decorator';

@Processor('import', { concurrency: 2, limiter: { max: 5, duration: 1000 } })
export class ImportProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(ImportProcessor.name);
	constructor(private importService: ImportService) {
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

	@LogExecutionTime
	private importCsvFile(data: { userId: string; filePath: string; originalName: string }) {
		return this.importService.importCsvFile(data);
	}

	@LogExecutionTime
	private importZipArchive(data: { userId: string; filePath: string; originalName: string }) {
		return this.importService.importZipArchive(data);
	}
}
