import { getApiToken } from '@/utils/token.ts';
import { getAppUrl } from '@/utils/url.ts';

type GraphQLResponse<T> = {
	data?: T;
	errors?: { message: string }[];
};

export async function graphqlFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
	const token = await getApiToken();
	let apiUrl = await getAppUrl();

	if (!apiUrl) {
		throw new Error('App URL not configured');
	}

	if (!apiUrl.endsWith('/api') && !apiUrl.endsWith('/api/')) {
		apiUrl = `${apiUrl.replace(/\/$/, '')}/api`;
	}

	const res = await fetch(`${apiUrl}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({
			query,
			variables,
		}),
		credentials: 'omit',
	});

	if (!res.ok) {
		throw new Error(`Network error: ${res.status}`);
	}

	const json = (await res.json()) as GraphQLResponse<T>;

	if (json.errors?.length) {
		throw new Error(json.errors[0].message);
	}

	if (!json.data) {
		throw new Error('No data returned from GraphQL');
	}

	return json.data;
}
