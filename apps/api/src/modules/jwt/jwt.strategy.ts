import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { SecurityConfig } from '../../config/config.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(readonly configService: ConfigService) {
		const securityConfig = configService.get<SecurityConfig>('security');
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req) => {
					let token = null;
					if (req && req.cookies) {
						token = req.cookies['token'];
					}
					return token;
				},
			]),
			secretOrKey: securityConfig!.jwtSecret,
		});
	}

	async validate(payload: any) {
		return { userId: payload.sub };
	}
}
