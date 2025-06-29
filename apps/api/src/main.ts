import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { join } from 'path';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config({
	path: join(__dirname, '../../../.env'),
});

import { AppModule } from './modules/app/app.module';
import { CorsConfig } from './config/config.interface';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const corsConfig = configService.get<CorsConfig>('cors');

	if (corsConfig?.enabled) {
		app.enableCors({
			credentials: true,
			origin: true,
		});
	}

	app.use(cookieParser());

	await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
