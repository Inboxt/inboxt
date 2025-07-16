import { Module } from '@nestjs/common';

import { SavedItemController } from './saved-item.controller';
import { SavedItemService } from './saved-item.service';
import { PrismaService } from 'src/services/prisma.service';
import { SavedItemManagementService } from './saved-item-management.service';
import { SavedItemResolver } from './saved-item.resolver';
import { ArticleModule } from './entities/article/article.module';
import { LabelModule } from './entities/label/label.module';
import { UserModule } from '../user/user.module';

@Module({
	imports: [ArticleModule, LabelModule, UserModule],
	providers: [SavedItemService, PrismaService, SavedItemManagementService, SavedItemResolver],
	controllers: [SavedItemController],
	exports: [SavedItemService],
})
export class SavedItemModule {}
