import { ApolloError } from '@apollo/client';

type FormFieldError = {
	path: string;
	message: string;
};

export const parseError = (
	error: ApolloError | string,
): { message: string; fieldErrors?: FormFieldError[] } | null => {
	if (typeof error === 'string') {
		return { message: error };
	}

	const graphQLErrors = error?.graphQLErrors;

	if (graphQLErrors && graphQLErrors.length > 0) {
		const gqlError = graphQLErrors[0];

		if (gqlError) {
			const extensions = gqlError.extensions as Record<string, any>;

			if (
				extensions?.response?.message &&
				Array.isArray(extensions.response.message)
			) {
				const fieldErrors: FormFieldError[] =
					extensions.response.message.map(
						(item: Record<string, any>) => ({
							path: item.path || 'unknown',
							message: item.message || 'Invalid value',
						}),
					);

				return {
					message: gqlError.message || 'Invalid input provided',
					fieldErrors,
				};
			}

			return {
				message: gqlError.message || 'An unknown error occurred.',
			};
		}
	}

	return null;
};
