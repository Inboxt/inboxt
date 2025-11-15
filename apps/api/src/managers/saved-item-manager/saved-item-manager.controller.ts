import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ActiveUserMeta, ActiveUserMetaType } from '../../decorators/active-user-meta.decorator';
import { Public } from '../../decorators/public.decorator';
import { SavedItemManagerService } from './saved-item-manager.service';
import { RateLimit } from '../../decorators/rate-limit.decorator';

@Controller('inbox/items')
export class SavedItemManagerController {
	constructor(private savedItemManagerService: SavedItemManagerService) {}

	@RateLimit({ user: { points: 150, duration: 60 * 60 } })
	@Post('from-url')
	async addArticleFromUrl(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Req() req: Request,
		@Res() res: Response,
	) {
		if (req.body && activeUser?.id) {
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
	@RateLimit({
		guest: {
			points: 300,
			duration: 60,
		},
	})
	async receiveNewsletter(@Body() body: any) {
		await this.savedItemManagerService.addNewsletterFromEmail(body);
		return;
	}
}
