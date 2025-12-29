import { Module } from '@nestjs/common';

import { LabelResolver } from './label.resolver';
import { LabelService } from './label.service';

@Module({
	providers: [LabelService, LabelResolver],
	exports: [LabelService],
})
export class LabelModule {}
