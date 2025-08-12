import { readLocalStorageValue } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { AppViews, SORT_VALUES } from '@inbox-reader/common';

import { ItemsList } from '~pages/ItemsList';

type SortOption = (typeof SORT_VALUES)[number];
export type AppSearch = {
	view?: AppViews | `label:${string}`;
	sort?: SortOption;
};

export const Route = createFileRoute('/_auth/')({
	component: ItemsList,
	validateSearch: (search: Record<string, unknown>): AppSearch => {
		let sort = search.sort as SortOption | undefined;

		if (!sort && typeof window !== 'undefined') {
			const storedSort: SortOption = readLocalStorageValue({ key: 'sort' });
			if (SORT_VALUES.includes(storedSort)) {
				sort = storedSort as AppSearch['sort'];
			}
		}

		if (sort && typeof window !== 'undefined') {
			localStorage.setItem('sort', sort);
		}

		if (!sort || !SORT_VALUES.includes(sort)) {
			sort = 'date_desc';
		}

		return {
			...search,
			view: (search.view as AppViews | undefined) || AppViews.INBOX,
			sort,
		};
	},
});
