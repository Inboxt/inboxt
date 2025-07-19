import { createFileRoute } from '@tanstack/react-router';
import { ItemsList } from '../pages/ItemsList';
import { AppViews } from '../constants';
import { readLocalStorageValue } from '@mantine/hooks';

const SORT_OPTIONS = ['date_asc', 'date_desc', 'title_asc', 'title_desc'] as const;

type SortOption = (typeof SORT_OPTIONS)[number];
export type AppSearch = {
	view?: AppViews | `label:${string}`;
	sort?: SortOption;
};

export const Route = createFileRoute('/_auth/')({
	component: ItemsList,
	validateSearch: (search: Record<string, unknown>): AppSearch => {
		let sort = search.sort as AppSearch['sort'] | undefined;

		if (!sort && typeof window !== 'undefined') {
			const storedSort = readLocalStorageValue({ key: 'sort' });
			if (SORT_OPTIONS.includes(storedSort as any)) {
				sort = storedSort as AppSearch['sort'];
			}
		}

		if (sort && typeof window !== 'undefined') {
			localStorage.setItem('sort', sort);
		}

		if (!SORT_OPTIONS.includes(sort as any)) {
			sort = 'date_desc';
		}

		return {
			...search,
			view: (search.view as AppViews) || AppViews.INBOX,
			sort,
		};
	},
});
