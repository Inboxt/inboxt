import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ActiveUserMeta } from '../../decorators/active-user-meta.decorator';
import { SavedItemManagementService } from './saved-item-management.service';

@Controller('inbox/items')
export class SavedItemController {
	constructor(private inboxManagementService: SavedItemManagementService) {}

	@Post('from-url')
	async addArticleFromUrl(
		@ActiveUserMeta() activeUser: ActiveUserMeta,
		@Req() req: Request,
		@Res() res: Response,
	) {
		if (req.body && activeUser) {
			await this.inboxManagementService.addArticleFromUrl(activeUser.userId, req.body.url);
		}

		res.sendStatus(200);
	}
}
