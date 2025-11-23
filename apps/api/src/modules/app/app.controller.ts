import { Controller, Get, HttpStatus } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from '../../decorators/public.decorator';
import { AppException } from '../../utils/app-exception';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@Public()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('notifications')
	@Public()
	async getNotifications() {
		const url = process.env.NOTIFICATIONS_URL;
		if (!url) {
			throw new AppException(
				'Notifications URL not configured',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		let response: Response;
		try {
			response = await fetch(url, { method: 'GET' });
		} catch (_err) {
			throw new AppException('Failed to fetch notifications', HttpStatus.BAD_GATEWAY);
		}

		if (!response.ok) {
			throw new AppException(
				`Upstream notifications error (status ${response.status})`,
				HttpStatus.BAD_GATEWAY,
			);
		}

		const data = await response.json();
		return data;
	}
}
