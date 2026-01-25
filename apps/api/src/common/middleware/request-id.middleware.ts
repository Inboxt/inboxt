import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const id = (req.headers['x-request-id'] as string) || randomUUID();
		req.id = id;
		res.setHeader('X-Request-Id', id);
		next();
	}
}
