import { createFileRoute } from '@tanstack/react-router';
import { ReaderView } from '../pages/ReaderView';

type ReaderSearch = {
	format?: string;
};

export const Route = createFileRoute('/r/$id')({
	component: ReaderView,
	validateSearch: (search: Record<string, unknown>): ReaderSearch => {
		return {
			format: (search.format as string) || undefined,
		};
	},
});
