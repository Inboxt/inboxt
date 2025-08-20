import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor } from '@nestjs/bullmq';

import { SavedItemType } from '../../../enums/saved-item-type.enum';
import { SavedItemService } from '../../../modules/saved-item/saved-item.service';
import { UserService } from '../../../modules/user/user.service';
import { NewsletterService } from '../../../modules/saved-item/entities/newsletter/newsletter.service';
import { NewsletterSubscriptionService } from '../../../modules/saved-item/entities/newsletter/newsletter-subscription/newsletter-subscription.service';
import { MailService } from '../../../modules/mail/mail.service';
import { BaseQueueProcessor } from '../../../common/processors/base-queue.processor';
import { LogExecutionTime } from '../../../decorators/log-execution-time.decorator';

@Processor('newsletter-processing', { concurrency: 3 })
export class SavedItemNewsletterProcessor extends BaseQueueProcessor {
	protected readonly logger = new Logger(SavedItemNewsletterProcessor.name);
	constructor(
		private savedItemService: SavedItemService,
		private userService: UserService,
		private newsletterService: NewsletterService,
		private newsletterSubscriptionService: NewsletterSubscriptionService,
		private mailService: MailService,
	) {
		super();
	}

	async process(job: Job): Promise<any> {
		switch (job.name) {
			case 'process-newsletter':
				return this.handleNewsletterProcessing(job.data);
			default:
				throw new Error(`Unknown job type: ${job.name}`);
		}
	}

	@LogExecutionTime
	private async handleNewsletterProcessing(payload) {
		const { success, shouldForward, data, userId } =
			await this.newsletterService.parse(payload);

		if (!success && !shouldForward) {
			return;
		}

		if (!success && shouldForward) {
			const user = await this.userService.get({ where: { id: userId } });
			if (!user) {
				return;
			}

			await this.mailService.forward(user.emailAddress, payload);
			return;
		}

		if (!data || !userId) {
			return;
		}

		const savedItem = await this.savedItemService.create(userId, {
			title: data?.title || '',
			type: SavedItemType.NEWSLETTER,
			wordCount: data.wordCount,
			author: data?.author,
			description: data?.description,
		});

		await this.newsletterService.create(savedItem.id, data.inboundEmailAddressId, {
			contentHtml: data?.contentHtml || 'Sorry, we were unable to parse the content.',
			contentText: data?.contentText || 'Sorry, we were unable to parse the content.',
			messageId: data.messageId,
		});

		if (data?.unsubscribeUrl && data?.author && data?.inboundEmailAddressId && userId) {
			let subscription = await this.newsletterSubscriptionService.get(userId, {
				where: { name: data.author, inboundEmailAddressId: data.inboundEmailAddressId },
			});

			if (subscription) {
				subscription = await this.newsletterSubscriptionService.update(
					userId,
					subscription.id,
					{
						lastReceivedAt: new Date(),
						unsubscribeAttemptedAt: null,
						status: 'ACTIVE',
						unsubscribeUrl: data?.unsubscribeUrl,
					},
				);
			} else {
				subscription = await this.newsletterSubscriptionService.create(
					userId,
					data.inboundEmailAddressId,
					{
						name: data.author,
						lastReceivedAt: new Date(),
						unsubscribeUrl: data?.unsubscribeUrl,
					},
				);
			}

			await this.newsletterSubscriptionService.link(userId, subscription.id, savedItem.id);
		}

		if (payload?.deletion_url) {
			await fetch(payload.deletion_url);
		}
	}
}
