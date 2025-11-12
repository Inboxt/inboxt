import { Module } from '@nestjs/common';

import { S3StorageService } from './s3-storage.service';
import { StorageQuotaService } from './storage-quota.service';
import { PrismaService } from '../../services/prisma.service';

@Module({
	providers: [PrismaService, S3StorageService, StorageQuotaService],
	exports: [S3StorageService, StorageQuotaService],
})
export class StorageModule {}
