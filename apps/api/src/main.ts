import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/nestjs';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { Logger } from 'nestjs-pino';

import { type Config } from '~config/index';
import { AppModule } from '~modules/app/app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
	app.useLogger(app.get(Logger));

	const configService = app.get(ConfigService<Config>);
	const errorsConfig = configService.get('errors', { infer: true });

	if (process.env.NODE_ENV === 'production' && errorsConfig?.apiDsn) {
		Sentry.init({
			dsn: errorsConfig.apiDsn,
		});
	}

	if (
		process.env.NODE_ENV === 'production' &&
		configService.get('security.jwtSecret', { infer: true }) === 'replace-with-a-random-string'
	) {
		console.error('ERROR: API_JWT_SECRET is set to the default value. Please change it!');
		process.exit(1);
	}

	const corsConfig = configService.get('cors', { infer: true });
	app.set('trust proxy', 1);

	if (corsConfig?.enabled) {
		app.enableCors({
			credentials: true,
			origin: true,
		});
	}

	app.use('/inbox/items/mail-webhook', json({ limit: '40mb' }));
	app.use(json({ limit: '1mb' }));

	app.use(cookieParser());

	await app.listen(process.env.API_PORT ?? 7000);
}

void bootstrap();
