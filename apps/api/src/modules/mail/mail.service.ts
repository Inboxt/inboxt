import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendEmail(
		to: string,
		subject: string,
		text = 'TODO: Use some sort of templater to render emails content',
	) {
		await this.mailerService.sendMail({
			to,
			subject,
			text,
			from: '"Inbox Reader" <no-reply@inbox-reader.com>',
		});
	}

	// Handle HTML version and overall better styling/description
	async forward(to: string, payload: any) {
		const subject = payload.headers?.Subject?.[0] || 'Email without subject';
		const from = payload.headers?.From?.[0] || 'Unknown sender';
		const date = payload.headers?.Date?.[0] || new Date().toISOString();
		const plainText = payload?.body?.stripped_plaintext || '';
		const htmlContent = payload?.body?.stripped_html || '';

		const explanationHeader = `This email couldn't be processed in Inbox Reader. We're forwarding it to you so you don't miss any content.`;
		const forwardedText = `${explanationHeader}
From: ${from}
Date: ${date}
Subject: ${subject}

${plainText}`;

		const mailOptions = {
			to,
			subject: `[Forwarded] ${subject}`,
			text: forwardedText,
			from: '"Inbox Reader" <no-reply@inbox-reader.com>',
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
		};

		await this.mailerService.sendMail(mailOptions);
	}
}
