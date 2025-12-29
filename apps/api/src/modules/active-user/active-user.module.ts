import { Module } from '@nestjs/common';

import { UserModule } from '~modules/user/user.module';

import { ActiveUserResolver } from './active-user.resolver';

@Module({
	imports: [UserModule],
	providers: [ActiveUserResolver],
})
export class ActiveUserModule {}
