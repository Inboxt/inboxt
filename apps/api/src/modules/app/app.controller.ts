import { Controller, Get, Header, HttpStatus } from '@nestjs/common';
import dayjs from 'dayjs';
import { ZodError } from 'zod';

import { Public } from '~common/decorators/public.decorator';
import { AppException } from '~common/utils/app-exception';

import { AppService } from './app.service';
import { notificationsSchema } from './notifications.schema';

let cachedNotifications: unknown[] | null = null;
let cacheExpiresAt: dayjs.Dayjs | null = null;

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
	@Header('Cache-Control', 'public, max-age=900')
	async getNotifications() {
		const now = dayjs();

		if (cachedNotifications && cacheExpiresAt && now.isBefore(cacheExpiresAt)) {
			return cachedNotifications;
		}

		const url = process.env.NOTIFICATIONS_URL;
		if (!url) {
			throw new AppException(
				'Notifications URL not configured',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Upstream status ${response.status}`);
			}

			const rawData = await response.json();

			let data;
			try {
				data = notificationsSchema.parse(rawData);
			} catch (err) {
				if (err instanceof ZodError) {
					console.error('Invalid notifications JSON', err.issues);

					if (cachedNotifications) {
						return cachedNotifications;
					}

					throw new AppException(
						'Invalid notifications data format',
						HttpStatus.BAD_GATEWAY,
					);
				}

				throw err;
			}

			cachedNotifications = data;
			cacheExpiresAt = now.add(15, 'minute');

			return data;
		} catch (_err) {
			if (cachedNotifications) {
				return cachedNotifications;
			}

			throw new AppException('Failed to fetch notifications', HttpStatus.BAD_GATEWAY);
		}
	}
}
