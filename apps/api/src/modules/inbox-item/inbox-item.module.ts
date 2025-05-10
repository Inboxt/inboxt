import { Module } from '@nestjs/common';

import { InboxItemController } from './inbox-item.controller';
import { InboxItemService } from './inbox-item.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
	providers: [InboxItemService, PrismaService],
	controllers: [InboxItemController],
	exports: [InboxItemService],
})
export class InboxItemModule {}
