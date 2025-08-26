import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import mjml2html from 'mjml';
import { forwardedEmailTemplate } from '../../mail-templates/forwardedEmailTemplate';
import { EMAIL_FORWARDED } from '../../common/constants/email.constants';

@Injectable()
export class MailService {
	constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

	async forward(to: string, payload: any) {
		const subject = payload.headers?.Subject?.[0] || 'Email without subject';
		const from = payload.headers?.From?.[0] || 'Unknown sender';
		const date = payload.headers?.Date?.[0] || new Date().toLocaleString(); // dayjs?
		const plainText = payload.body?.stripped_plaintext || '';
		const htmlContent = payload.body?.stripped_html || '';

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
				'X-Inbox-Reader-Forwarded': 'true',
				'X-Original-From': from,
				'X-Original-To': payload.headers?.To?.[0] || '',
				'X-Original-Subject': subject,
				'X-Original-Date': date,
				'X-Original-Message-ID': payload.headers?.['Message-ID']?.[0] || '',
				References:
					payload.headers?.References?.[0] || payload.headers?.['Message-ID']?.[0] || '',
				'In-Reply-To': payload.headers?.['Message-ID']?.[0] || '',
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
