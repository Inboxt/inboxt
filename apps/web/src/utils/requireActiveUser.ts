import { redirect } from '@tanstack/react-router';

import { ACTIVE_USER } from '~lib/graphql';
import { client } from '~lib/graphql/client.ts';

export const requireActiveUser = async () => {
	const { data } = await client.query({
		query: ACTIVE_USER,
		fetchPolicy: 'network-only',
	});

	if (!data.me) {
		throw redirect({ to: '/auth' });
	}

	return { user: data.me };
};
