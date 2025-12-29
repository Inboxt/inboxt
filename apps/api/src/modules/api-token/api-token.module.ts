import { Module } from '@nestjs/common';

import { ApiTokenResolver } from './api-token.resolver';
import { ApiTokenService } from './api-token.service';

@Module({
	providers: [ApiTokenService, ApiTokenResolver],
	exports: [ApiTokenService],
})
export class ApiTokenModule {}
