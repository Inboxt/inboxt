import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { json } from 'express';

import { type Config } from '~config/index';
import { AppModule } from '~modules/app/app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	const configService = app.get(ConfigService<Config>);
	const corsConfig = configService.getOrThrow('cors', { infer: true });

	app.set('trust proxy', 1);

	if (corsConfig?.enabled) {
		app.enableCors({
			credentials: true,
			origin: ['https://use.inboxt.app'],
		});
	}

	app.use('/inbox/items/mail-webhook', json({ limit: '40mb' }));
	app.use(json({ limit: '1mb' }));

	app.use(cookieParser());

	await app.listen(process.env.PORT ?? 7000);
}

void bootstrap();
