import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { PrismaService } from '../../services/prisma.service';
import { UserResolver } from './user.resolver';
import { MailModule } from '../mail/mail.module';

@Module({
	imports: [MailModule],
	providers: [UserService, PrismaService, UserResolver],
	exports: [UserService],
})
export class UserModule {}
