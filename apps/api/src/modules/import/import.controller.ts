import {
	Controller,
	Post,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Body,
	HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import crypto from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { VOID_RESPONSE } from '~common/constants/void';
import { VerifiedOnly } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';
import { ImportType } from '~common/enums/import-type.enum';
import { GqlAuthGuard } from '~common/guards/auth.guard';
import { AppException } from '~common/utils/app-exception';

import { ImportService } from './import.service';

const storage = diskStorage({
	destination: (_req, _file, cb) => cb(null, '/tmp'),
	filename: (_req, file, cb) => {
		cb(null, `${crypto.randomUUID()}${extname(file.originalname)}`);
	},
});

@Controller()
@UseGuards(GqlAuthGuard)
@VerifiedOnly()
export class ImportController {
	constructor(private readonly importService: ImportService) {}

	@Post('import')
	@UseInterceptors(
		FileInterceptor('file', {
			storage,
			limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
		}),
	)
	@RateLimit({
		user: { points: 15, duration: 60 * 60 },
	})
	async uploadImportFile(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@UploadedFile() file: Express.Multer.File,
		@Body('type') type: ImportType,
	) {
		if (!file) {
			throw new AppException('File is required', HttpStatus.BAD_REQUEST);
		}

		if (!type) {
			throw new AppException('type is required', HttpStatus.BAD_REQUEST);
		}

		if (type === ImportType.CSV) {
			const ok =
				file.mimetype === 'text/csv' ||
				file.mimetype === 'application/vnd.ms-excel' ||
				file.originalname.toLowerCase().endsWith('.csv');

			if (!ok) {
				throw new AppException('Expected a CSV file', HttpStatus.BAD_REQUEST);
			}
		}

		if (type === ImportType.ZIP_ARCHIVE) {
			const ok =
				file.mimetype === 'application/zip' ||
				file.originalname.toLowerCase().endsWith('.zip');

			if (!ok) {
				throw new AppException('Expected a ZIP file', HttpStatus.BAD_REQUEST);
			}
		}

		await this.importService.enqueueImport({
			userId: activeUser.id,
			type,
			source: {
				kind: 'disk',
				path: file.path,
				originalName: file.originalname,
				mime: file.mimetype,
				size: file.size,
			},
		});

		return VOID_RESPONSE;
	}
}
