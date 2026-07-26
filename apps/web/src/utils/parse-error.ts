type FormFieldError = {
	path: string;
	message: string;
};

interface ServerErrorExtensions {
	response?: {
		message?: Array<{
			path?: string;
			message?: string;
		}>;
	};
}

import { CombinedGraphQLErrors } from '@apollo/client';

export const parseError = (
	error?: unknown,
): { message: string; fieldErrors?: FormFieldError[] } | null => {
	if (typeof error === 'string') {
		return { message: error };
	}

	if (!CombinedGraphQLErrors.is(error)) {
		return null;
	}

	const gqlError = error.errors[0];

	if (!gqlError) {
		return null;
	}

	const extensions = gqlError.extensions as ServerErrorExtensions;

	if (Array.isArray(extensions?.response?.message)) {
		return {
			message: gqlError.message,
			fieldErrors: extensions.response.message.map(({ path, message }) => ({
				path: path ?? 'unknown',
				message: message ?? 'Invalid value',
			})),
		};
	}

	return {
		message: gqlError.message,
	};
};
