import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
	constructor(
		message: string,
		status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
		code?: string,
	) {
		super(
			{
				message,
				code: code || HttpStatus[status],
			},
			status,
		);
	}
}
