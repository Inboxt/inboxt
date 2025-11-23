import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';
import { type Config } from '../../config';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		NestJwtModule.registerAsync({
			useFactory: (configService: ConfigService<Config>) => {
				const securityConfig = configService.getOrThrow('security', { infer: true });
				return {
					secret: securityConfig.jwtSecret,
					signOptions: {
						expiresIn: securityConfig.expiresIn as any,
					},
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [JwtStrategy],
	exports: [NestJwtModule],
})
export class JwtModule {}
