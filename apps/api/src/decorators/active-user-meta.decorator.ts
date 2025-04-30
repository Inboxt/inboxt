import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const ActiveUserMeta = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req.user;
	},
);

export type ActiveUserMeta = {
	userId: number;
};
