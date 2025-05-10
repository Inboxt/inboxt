import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ActiveUserMeta } from '../../decorators/active-user-meta.decorator';
import { InboxItemService } from './inbox-item.service';

@Controller()
export class InboxItemController {
	constructor(private articleService: InboxItemService) {}

	@Post('items/from-url')
	async addArticleFromUrl(
		@ActiveUserMeta() activeUser: ActiveUserMeta,
		@Req() req: Request,
		@Res() res: Response,
	) {
		if (req.body && activeUser) {
			await this.articleService.addArticleFromUrl(activeUser.userId, req.body.url);
		}

		res.sendStatus(200);
	}
}
