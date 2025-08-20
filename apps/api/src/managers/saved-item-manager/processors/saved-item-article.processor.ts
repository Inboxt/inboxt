import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor } from '@nestjs/bullmq';

import { ArticleService } from '../../../modules/saved-item/entities/article/article.service';
import { SavedItemService } from '../../../modules/saved-item/saved-item.service';
import { Prisma } from '../../../../prisma/client';
import { LogExecutionTime } from '../../../decorators/log-execution-time.decorator';
import { BaseQueueProcessor } from '../../../common/processors/base-queue.processor';
import { SavedItemManagerService } from '../saved-item-manager.service';

interface ArticleProcessingJobData {
	userId: string;
	url: string;
	savedItemId: string;
	prismaData?: Partial<
		Omit<Prisma.saved_itemCreateInput, 'user' | 'saved_item_label' | 'article' | 'id'>
	>;
}

@Processor('article-processing', { concurrency: 5 })
export class SavedItemArticleProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(SavedItemArticleProcessor.name);
	constructor(
		private articleService: ArticleService,
		private savedItemService: SavedItemService,
		private savedItemManagerService: SavedItemManagerService,
	) {
		super();
	}

	async process(job: Job<ArticleProcessingJobData>): Promise<any> {
		switch (job.name) {
			case 'process-article':
				return this.handleArticleProcessing(job.data);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async handleArticleProcessing(data: ArticleProcessingJobData) {
		const { userId, url, prismaData, savedItemId } = data;

		await this.savedItemManagerService.handleArticleProcessing(
			userId,
			savedItemId,
			url,
			prismaData,
		);
	}

	@OnWorkerEvent('failed')
	async onJobFailed(job: Job<ArticleProcessingJobData>, error: Error) {
		super.onFailed(job, error);

		try {
			if (job.data?.savedItemId && job.data?.userId) {
				const domain = job.data.url
					? new URL(job.data.url).hostname.replace(/^www\./, '')
					: '';

				let errorDescription = '';
				if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
					errorDescription = `We couldn't connect to ${domain}. The website might be temporarily unavailable or the URL might be incorrect. You can try again later.`;
				} else if (error.message.includes('unsupported')) {
					errorDescription = `We couldn't process this content from ${domain}. The page might be using features that aren't supported by our parser.`;
				} else if (error.message.includes('too large')) {
					errorDescription = `This article from ${domain} is too large for our system to process. Try saving a more specific section of the content.`;
				} else {
					errorDescription = `We couldn't process this content from ${domain}. You might try visiting the original website directly. If this problem persists with other articles, please contact support.`;
				}

				await this.savedItemService.update(job.data.userId, job.data.savedItemId, {
					title: 'Something went wrong, processing failed',
					description: errorDescription,
				});

				await this.articleService.update(job.data.savedItemId, job.data.userId, {
					contentHtml: errorDescription,
					contentText: errorDescription,
				});

				this.logger.log(`Updated item ${job.data.savedItemId} with error content`, {
					userId: job.data.userId,
					url: job.data.url,
					errorMessage: error.message,
				});
			}
		} catch (updateError) {
			this.logger.error(`Failed to update placeholder status: ${updateError.message}`);
		}
	}
}
