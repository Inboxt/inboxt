import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../../services/prisma.service';
import { PasswordService } from './services/password.service';
import { JwtModule } from '../jwt/jwt.module';
import { MailModule } from '../mail/mail.module';
import { VerificationService } from './services/verification.service';

@Module({
	imports: [JwtModule, UserModule, MailModule],
	providers: [
		AuthService,
		AuthResolver,
		PrismaService,
		PasswordService,
		VerificationService,
	],
	exports: [AuthService],
})
export class AuthModule {}
