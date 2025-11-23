import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Config } from '../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(readonly configService: ConfigService<Config>) {
		const securityConfig = configService.getOrThrow('security', { infer: true });
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
			secretOrKey: securityConfig.jwtSecret,
		});
	}

	async validate(payload: any) {
		return { id: payload.sub };
	}
}
