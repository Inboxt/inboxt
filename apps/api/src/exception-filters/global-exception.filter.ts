import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { GqlExceptionFilter, GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GlobalExceptionFilter
	implements ExceptionFilter, GqlExceptionFilter
{
	private handleException(exception: unknown) {
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();

			const responseBody =
				typeof response === 'object' && response !== null
					? (response as Record<string, any>)
					: { message: response };

			return {
				status: responseBody.statusCode ?? status,
				message: responseBody.message ?? exception.message,
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
		const { status, message, code } = this.handleException(exception);

		if (contextType === 'graphql') {
			return new GraphQLError(message, {
				extensions: {
					code,
					status,
				},
			});
		}

		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		response.status(status).json({
			status, // 'status' field now contains the status code
			message,
			code,
			path: request.url,
		});
	}
}
