import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';
import { SecurityConfig } from '../../config/config.interface';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		NestJwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				const securityConfig = configService.get<SecurityConfig>('security');

				return {
					secret: securityConfig!.jwtSecret,
					signOptions: {
						expiresIn: securityConfig!.expiresIn,
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
