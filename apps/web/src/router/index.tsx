import { createRouter } from '@tanstack/react-router';

import { routeTree } from '../routeTree.gen.ts';

export const router = createRouter({
	routeTree,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
	interface HistoryState {
		emailAddress?: string;
	}
}

declare module '@tanstack/history' {
	interface HistoryState {
		emailAddress: string;
	}
}
