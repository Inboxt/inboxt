import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import { client } from '../lib/apolloClient';
import { ACTIVE_USER } from '../lib/graphql';

export const Route = createFileRoute('/_auth')({
	beforeLoad: async () => {
		const { data } = await client.query({
			query: ACTIVE_USER,
			fetchPolicy: 'network-only',
		});

		if (!data?.me) {
			throw redirect({
				to: '/auth',
			});
		}

		return {
			user: data.me,
		};
	},
	component: () => <Outlet />,
});
