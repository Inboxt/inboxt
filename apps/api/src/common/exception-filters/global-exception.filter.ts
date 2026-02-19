import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import * as Sentry from '@sentry/nestjs';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

import { Config } from '~config/index';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
	constructor(@Inject(ConfigService) private readonly configService: ConfigService<Config>) {}

	private handleException(exception: unknown) {
		if (exception instanceof ZodError) {
			const errors = exception.issues.map((error) => ({
				path: error.path.join('.'),
				message: error.message,
			}));

			return {
				status: HttpStatus.BAD_REQUEST,
				message: 'Invalid input provided',
				code: 'BAD_USER_INPUT',
				response: {
					statusCode: HttpStatus.BAD_REQUEST,
					message: errors,
					error: 'Bad Request',
				},
			};
		}

		const errorsConfig = this.configService.get('errors', { infer: true });
		if (process.env.NODE_ENV === 'production' && errorsConfig?.apiDsn) {
			Sentry.captureException(exception);
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();

			const responseBody =
				typeof response === 'object' && response !== null
					? (response as Record<string, any>)
					: { message: response };

			return {
				status: responseBody.statusCode ?? status,
				message: (responseBody.message as string) ?? exception.message,
				code: responseBody.code ?? HttpStatus[status],
			};
		}

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			message: 'Internal server error',
			code: 'INTERNAL_SERVER_ERROR',
		};
	}

	catch(exception: unknown, host: ArgumentsHost) {
		const contextType = host.getType<GqlContextType>();
		const { status, message, code, response } = this.handleException(exception);

		if (contextType === 'graphql') {
			return new GraphQLError(message, {
				extensions: {
					code,
					status,
					response,
				},
			});
		}

		const ctx = host.switchToHttp();
		const res = ctx.getResponse();
		const req = ctx.getRequest();

		res.status(status).json({
			status,
			message,
			code,
			path: req.url,
			...(response ? { response } : {}),
		});
	}
}
