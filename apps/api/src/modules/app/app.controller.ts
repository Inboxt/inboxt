import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join, normalize } from 'path';

import { Public } from '~common/decorators/public.decorator';
import { AppException } from '~common/utils/app-exception';
import { Config } from '~config/index';

import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly configService: ConfigService<Config>,
	) {}

	@Get('config')
	@Public()
	getConfig() {
		const errors = this.configService.get('errors', { infer: true });
		return {
			appUrl: this.configService.get('appUrl', { infer: true }),
			webErrorsDsn: errors?.webDsn,
		};
	}

	@Get()
	@Public()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('exports/:userId/:filename')
	@Public()
	async downloadExport(
		@Param('userId') userId: string,
		@Param('filename') filename: string,
		@Query('sig') sig: string,
		@Res() res: Response,
	) {
		const securityConfig = this.configService.getOrThrow('security', { infer: true });
		if (!sig) {
			throw new AppException('Missing signature', HttpStatus.UNAUTHORIZED);
		}

		const expectedSignature = createHmac('sha256', securityConfig.jwtSecret)
			.update(`${userId}/${filename}`)
			.digest('hex');

		try {
			if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))) {
				throw new Error('Invalid signature');
			}
		} catch (_err) {
			throw new AppException('Invalid signature', HttpStatus.UNAUTHORIZED);
		}

		const exportsConfig = this.configService.getOrThrow('exports', { infer: true });
		const baseDir = normalize(exportsConfig.localPath);
		const filePath = normalize(join(baseDir, userId, filename));

		if (!filePath.startsWith(baseDir)) {
			throw new AppException('Invalid file path', HttpStatus.BAD_REQUEST);
		}

		try {
			const stats = await stat(filePath);
			if (!stats.isFile()) {
				throw new Error('Not a file');
			}

			res.setHeader('Content-Type', 'application/zip');
			res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
			res.setHeader('Content-Length', stats.size);

			const stream = createReadStream(filePath);
			stream.pipe(res);
		} catch (_err) {
			throw new AppException('Export file not found', HttpStatus.NOT_FOUND);
		}
	}
}
