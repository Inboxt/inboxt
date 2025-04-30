import { ApolloError } from '@apollo/client';

export const parseError = (error: ApolloError | string): string | null => {
	if (typeof error === 'string') {
		return error;
	}

	const graphQLErrors = error?.graphQLErrors;
	if (graphQLErrors && graphQLErrors.length > 0) {
		return graphQLErrors[0]?.message || 'An unknown error occurred.';
	}

	return null;
};
