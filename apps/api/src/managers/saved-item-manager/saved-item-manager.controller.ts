import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Public } from '../../decorators/public.decorator';
import { SavedItemManagerService } from './saved-item-manager.service';

@Controller('inbox/items')
export class SavedItemManagerController {
	constructor(private savedItemManagerService: SavedItemManagerService) {}

	@Post('from-url')
	async addArticleFromUrl(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Req() req: Request,
		@Res() res: Response,
	) {
		if (req.body && activeUser) {
			await this.savedItemManagerService.addArticleFromUrl(
				activeUser.id,
				req.body.url,
				req?.body?.labelIds || [],
			);
		}

		res.sendStatus(200);
	}

	@Public()
	@Post('mail-webhook')
	@HttpCode(200)
	async receiveNewsletter(@Body() body: any) {
		await this.savedItemManagerService.addNewsletterFromEmail(body);
		return;
	}
}
