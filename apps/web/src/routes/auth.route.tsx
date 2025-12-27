import { createFileRoute, redirect } from '@tanstack/react-router';

import { ACTIVE_USER } from '~lib/graphql';
import { client } from '~lib/graphql/client.ts';
import { Auth } from '~pages/Auth';

export type AuthMode = 'login' | 'signup' | 'demo' | 'forgot-password' | undefined;

export type AuthSearch = {
	mode?: AuthMode;
};

export const Route = createFileRoute('/auth')({
	component: Auth,
	validateSearch: (search: Record<string, unknown>): AuthSearch => {
		return {
			mode: (search.mode as AuthSearch['mode']) || undefined,
		};
	},
	beforeLoad: async () => {
		const { data } = await client.query({
			query: ACTIVE_USER,
			fetchPolicy: 'network-only',
		});

		if (data.me) {
			throw redirect({
				to: '/',
			});
		}
	},
});
