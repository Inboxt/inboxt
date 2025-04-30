import { Request, Response } from 'express';

export interface GqlContext {
	req: Request & { cookies: Record<string, string>; user?: any };
	res: Response;
}
