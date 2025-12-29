import { Module } from '@nestjs/common';

import { SavedItemManagerModule } from '~managers/saved-item-manager/saved-item-manager.module';
import { PasswordService } from '~modules/auth/services/password.service';
import { JwtModule } from '~modules/jwt/jwt.module';
import { MailModule } from '~modules/mail/mail.module';
import { UserModule } from '~modules/user/user.module';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
	imports: [JwtModule, UserModule, MailModule, SavedItemManagerModule],
	providers: [AuthService, AuthResolver, PasswordService],
	exports: [AuthService],
})
export class AuthModule {}
