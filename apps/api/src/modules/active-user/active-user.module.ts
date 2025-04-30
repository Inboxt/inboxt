import { Module } from '@nestjs/common';

import { ActiveUserResolver } from './active-user.resolver';
import { UserModule } from '../user/user.module';

@Module({
	imports: [UserModule],
	providers: [ActiveUserResolver],
})
export class ActiveUserModule {}
