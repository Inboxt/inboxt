import { Injectable } from '@nestjs/common';

import { addItemFromUrlSchema } from '@inbox-reader/schemas';

import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import { InboxItemType } from '../../enums/inbox-item-type.enum';

@Injectable()
export class InboxItemService {
	constructor(private prisma: PrismaService) {}

	async get(query: Prisma.inbox_itemFindUniqueArgs) {
		return this.prisma.inbox_item.findUnique(query);
	}

	async getMany(query: Prisma.inbox_itemFindManyArgs) {
		return this.prisma.inbox_item.findMany(query);
	}

	async addArticleFromUrl(userId: number, url: string) {
		await addItemFromUrlSchema.parseAsync({ url });

		// todo: parse the article
		return this.create({ originalUrl: url, userId, type: InboxItemType.ARTICLE });
	}

	async create(data: Prisma.inbox_itemCreateArgs['data']) {
		return this.prisma.inbox_item.create({ data });
	}
}
