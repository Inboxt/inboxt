import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import mjml2html from 'mjml';

import { EMAIL_FORWARDED } from '~common/constants/email.constants';
import { forwardedEmailTemplate } from '~mail-templates/forwardedEmailTemplate';
import { ContentExtractionService } from '~services/content-extraction.service';

@Injectable()
export class MailService {
	constructor(
		@InjectQueue('mail') private readonly mailQueue: Queue,
		private readonly contentExtractionService: ContentExtractionService,
	) {}

	async forward(
		to: string,
		data: {
			subject?: string | null;
			from?: string | null;
			date?: string | null;
			plainText?: string | null;
			htmlContent?: string | null;
			messageId?: string | null;
			toHeader?: string | null;
			references?: string | null;
		},
	) {
		const subject = data.subject || 'Email without subject';
		const from = data.from || 'Unknown sender';
		const date = data.date || dayjs().format('MMMM D, YYYY [at] h:mm A');
		const plainText = data.plainText || '';
		const rawHtmlContent = data.htmlContent || '';
		const messageId = data.messageId || '';
		const toHeader = data.toHeader || '';
		const references = data.references || '';

		let htmlContent = rawHtmlContent;

		if (htmlContent) {
			htmlContent = this.contentExtractionService.sanitizeHtml(htmlContent);
		}

		await this.sendTemplate({
			to,
			subject: EMAIL_FORWARDED.subject({ originalSubject: subject }),
			template: forwardedEmailTemplate,
			templateData: {
				from,
				date,
				originalSubject: subject,
				plainText,
				htmlContent,
			},
			headers: {
				'X-Inboxt-Forwarded': 'true',
				'X-Original-From': from,
				'X-Original-To': toHeader,
				'X-Original-Subject': subject,
				'X-Original-Date': date,
				'X-Original-Message-ID': messageId,
				References: references || messageId,
				'In-Reply-To': messageId,
			},
		});
	}

	private renderTemplate<T>(template: (args: T) => string, args: T): string {
		return mjml2html(template(args), { validationLevel: 'soft', keepComments: false }).html;
	}

	async sendTemplate<TData>(options: {
		to: string;
		subject: string;
		template: (data: TData) => string;
		templateData: TData;
		headers?: Record<string, string>;
	}) {
		await this.mailQueue.add('send', {
			to: options.to,
			subject: options.subject,
			html: this.renderTemplate(options.template, options.templateData),
			headers: options.headers,
		});
	}
}
