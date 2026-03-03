import { UseGuards, Body, Controller, HttpCode, Post } from '@nestjs/common';

import { Public } from '~common/decorators/public.decorator';
import { RateLimit } from '~common/decorators/rate-limit.decorator';
import { WebhookSecretGuard } from '~common/guards/webhook-secret.guard';

import { SavedItemManagerService } from './saved-item-manager.service';

@Controller('inbox/items')
export class SavedItemManagerController {
	constructor(private readonly savedItemManagerService: SavedItemManagerService) {}

	@Public()
	@UseGuards(WebhookSecretGuard)
	@Post('mail-webhook')
	@HttpCode(200)
	@RateLimit({
		guest: {
			points: 60,
			duration: 60,
		},
	})
	async receiveNewsletter(@Body() body: any) {
		await this.savedItemManagerService.addNewsletterFromEmail(body);
		return;
	}
}
