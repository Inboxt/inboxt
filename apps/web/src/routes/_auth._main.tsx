import { readLocalStorageValue } from '@mantine/hooks';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { SORT_VALUES } from '@inboxt/common';

import { ItemsList } from '~pages/ItemsList';

type SortOption = (typeof SORT_VALUES)[number];

export type RouteSearchParams = {
	sort?: SortOption;
	q?: string;
	modal?: 'api-tokens';
};

const isSortOption = (value: unknown): value is SortOption =>
	typeof value === 'string' && SORT_VALUES.includes(value as SortOption);

export const Route = createFileRoute('/_auth/_main')({
	validateSearch: (search: Record<string, unknown>): RouteSearchParams => {
		let sort = search.sort as SortOption | undefined;

		if (!sort && typeof window !== 'undefined') {
			const storedSort = readLocalStorageValue({ key: 'sort' });

			if (isSortOption(storedSort)) {
				sort = storedSort;
			}
		}

		if (sort && typeof window !== 'undefined') {
			localStorage.setItem('sort', sort);
		}

		if (!sort || !isSortOption(sort)) {
			sort = 'date_desc';
		}

		return {
			q: (search.q as string) || 'in:inbox type:article is:unread',
			sort,
			modal: search.modal === 'api-tokens' ? 'api-tokens' : undefined,
		};
	},
	component: () => (
		<>
			<ItemsList />
			<Outlet />
		</>
	),
});
