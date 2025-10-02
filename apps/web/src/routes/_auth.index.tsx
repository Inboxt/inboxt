import { readLocalStorageValue } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { SORT_VALUES } from '@inbox-reader/common';

import { ItemsList } from '~pages/ItemsList';

type SortOption = (typeof SORT_VALUES)[number];
export type RouteSearchParams = {
	sort?: SortOption;
	q?: string;
};

export const Route = createFileRoute('/_auth/')({
	component: ItemsList,
	validateSearch: (search: Record<string, unknown>): RouteSearchParams => {
		let sort = search.sort as SortOption | undefined;

		if (!sort && typeof window !== 'undefined') {
			const storedSort: SortOption = readLocalStorageValue({ key: 'sort' });
			if (SORT_VALUES.includes(storedSort)) {
				sort = storedSort as RouteSearchParams['sort'];
			}
		}

		if (sort && typeof window !== 'undefined') {
			localStorage.setItem('sort', sort);
		}

		if (!sort || !SORT_VALUES.includes(sort)) {
			sort = 'date_desc';
		}

		return {
			q: (search.q as string) || 'in:inbox type:article',
			sort,
		};
	},
});
