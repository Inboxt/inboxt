const API_URL = import.meta.env.VITE_API_URL;

type GraphQLResponse<T> = {
	data?: T;
	errors?: { message: string }[];
};

export async function graphqlFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
	const res = await fetch(`${API_URL}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query,
			variables,
		}),
		credentials: 'include',
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
