import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { Prisma } from '@inboxt/prisma';

import { LogExecutionTime } from '~common/decorators/log-execution-time.decorator';
import { BaseQueueProcessor } from '~common/processors/base-queue.processor';
import { ProcessArticleInput } from '~modules/saved-item/entities/article/article.service';
import { ProcessNewsletterInput } from '~modules/saved-item/entities/newsletter/newsletter.service';

import { SavedItemManagerService } from './saved-item-manager.service';

interface ArticleProcessingJobData {
	userId: string;
	savedItemId: string;
	input: ProcessArticleInput;
	prismaData?: Partial<
		Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
	>;
}

interface NewsletterProcessingJobData {
	ids: {
		userId: string;
		savedItemId: string;
		inboundEmailAddressId: string | null;
		messageId: string | null;
	};
	input: ProcessNewsletterInput;
	prismaData?: Partial<
		Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'newsletter' | 'id'>
	>;
	unsubscribeUrl?: string;
}

type SavedItemJob =
	| { name: 'process-article'; data: ArticleProcessingJobData }
	| { name: 'process-newsletter'; data: NewsletterProcessingJobData };

@Processor('saved-item-processing', { concurrency: 5, lockDuration: 120000 })
export class SavedItemManagerProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(SavedItemManagerProcessor.name);
	constructor(private readonly savedItemManagerService: SavedItemManagerService) {
		super();
	}

	async process(job: Job<SavedItemJob['data'], any, SavedItemJob['name']>): Promise<void> {
		switch (job.name) {
			case 'process-article':
				return this.handleArticleProcessing(job.data as ArticleProcessingJobData);
			case 'process-newsletter':
				return this.handleNewsletterProcessing(job.data as NewsletterProcessingJobData);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async handleArticleProcessing(data: ArticleProcessingJobData) {
		const { userId, savedItemId, input, prismaData } = data;
		await this.savedItemManagerService.processArticle(userId, savedItemId, input, prismaData);
	}

	@LogExecutionTime
	private async handleNewsletterProcessing(data: NewsletterProcessingJobData) {
		const { ids, input, prismaData, unsubscribeUrl } = data;

		await this.savedItemManagerService.processNewsletter(
			ids,
			input,
			prismaData,
			unsubscribeUrl,
		);
	}

	@OnWorkerEvent('failed')
	onJobFailed(job: Job, error: Error) {
		const attempts = job?.opts?.attempts ?? 1;
		const attemptsMade = job?.attemptsMade ?? 0;
		const isFinalFailure = attemptsMade >= attempts;

		if (!isFinalFailure) {
			return;
		}

		if (job.name === 'process-article') {
			const data = job.data as ArticleProcessingJobData;
			void this.savedItemManagerService.createFailedItem(
				data.userId,
				data.savedItemId,
				error,
			);
		} else if (job.name === 'process-newsletter') {
			const data = job.data as NewsletterProcessingJobData;
			void this.savedItemManagerService.createFailedItem(
				data.ids.userId,
				data.ids.savedItemId,
				error,
			);
		}
	}
}
