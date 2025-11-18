import { Module } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { ApiTokenService } from './api-token.service';
import { ApiTokenResolver } from './api-token.resolver';

@Module({
	imports: [],
	providers: [PrismaService, ApiTokenService, ApiTokenResolver],
	exports: [ApiTokenService],
})
export class ApiTokenModule {}
