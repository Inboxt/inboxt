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
}
