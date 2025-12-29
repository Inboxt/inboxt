import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { Public } from '~common/decorators/public.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';

import { SavedItemManagerService } from './saved-item-manager.service';

@Controller('inbox/items')
export class SavedItemManagerController {
	constructor(private readonly savedItemManagerService: SavedItemManagerService) {}

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
