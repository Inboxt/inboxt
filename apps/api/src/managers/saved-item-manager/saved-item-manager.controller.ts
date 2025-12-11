import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { Public } from '../../decorators/public.decorator';
import { SavedItemManagerService } from './saved-item-manager.service';
import { RateLimit } from '../../decorators/rate-limit.decorator';

@Controller('inbox/items')
export class SavedItemManagerController {
	constructor(private savedItemManagerService: SavedItemManagerService) {}

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
