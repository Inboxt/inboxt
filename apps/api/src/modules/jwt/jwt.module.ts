import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { type Config } from '~config/index';

import { JwtStrategy } from './jwt.strategy';

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
