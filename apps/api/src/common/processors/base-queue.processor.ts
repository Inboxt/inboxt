import { Job } from 'bullmq';
import { Logger, HttpException } from '@nestjs/common';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';

export abstract class BaseQueueProcessor extends WorkerHost {
	protected abstract readonly logger: Logger;

	@OnWorkerEvent('completed')
	onCompleted(job: Job) {
		this.logger.debug(`Job ${job.name} (id: ${job.id}) completed successfully`);
	}

	@OnWorkerEvent('failed')
	onFailed(job: Job, error: Error) {
		const executionTime = (error as any).executionTime;
		const timeInfo = executionTime ? ` after ${executionTime}ms` : '';

		if (error instanceof HttpException) {
			const response = error.getResponse() as any;
			this.logger.error(
				`Job ${job.name || 'unknown'} (id: ${job.id || 'unknown'}) failed${timeInfo} with AppException: ${response.message} (${response.code})`,
				error.stack,
			);
		} else {
			this.logger.error(
				`Job ${job.name || 'unknown'} (id: ${job.id || 'unknown'}) failed${timeInfo}: ${error.message || 'No error message'}`,
				error.stack,
			);
		}
	}

	@OnWorkerEvent('stalled')
	onStalled(jobId: string) {
		this.logger.warn(`Job (id: ${jobId}) has stalled`);
	}
}
