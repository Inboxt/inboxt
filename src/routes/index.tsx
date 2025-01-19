import { createFileRoute } from '@tanstack/react-router';
import { ItemsList } from '../components/ItemsList';
import { AppViews } from '../constants';

export type AppSearch = {
	view: AppViews | `label:${string}`;
	search?: string;
};

export const Route = createFileRoute('/')({
	component: ItemsList,
	validateSearch: (search: Record<string, unknown>): AppSearch => {
		return {
			...search,
			view: (search.view as AppViews) || AppViews.INBOX,
		};
	},
});
