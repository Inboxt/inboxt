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
import { diskStorage } from 'multer';
import { extname } from 'path';
import crypto from 'crypto';

import { ImportService } from './import.service';
import { GqlAuthGuard } from '../../guards/auth.guard';
import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { VerifiedOnly } from '../../decorators/account.decorator';
import { ImportType } from '../../common/enums/import-type.enum';
import { AppException } from '../../utils/app-exception';
import { VOID_RESPONSE } from '../../constants/void';

const storage = diskStorage({
	destination: (req, file, cb) => cb(null, '/tmp'),
	filename: (req, file, cb) => {
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
