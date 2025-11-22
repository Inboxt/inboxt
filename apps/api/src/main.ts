import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config({
	path: join(__dirname, '../../../.env'),
});

import { AppModule } from './modules/app/app.module';
import { CorsConfig } from './config/config.interface';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	const configService = app.get(ConfigService);
	const corsConfig = configService.get<CorsConfig>('cors');

	if (corsConfig?.enabled) {
		app.enableCors({
			credentials: true,
			origin: true,
		});
	}

	app.use('/inbox/items/mail-webhook', json({ limit: '40mb' }));
	app.use(json({ limit: '100kb' }));

	app.use(cookieParser());

	await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
