import { createFileRoute } from '@tanstack/react-router';

import { ShareTarget } from '~pages/ShareTarget';

type ShareSearchParams = {
	title?: string;
	text?: string;
	url?: string;
};

export const Route = createFileRoute('/_auth/share-target')({
	validateSearch: (search: Record<string, unknown>): ShareSearchParams => {
		return {
			title: (search.title as string) || undefined,
			text: (search.text as string) || undefined,
			url: (search.url as string) || undefined,
		};
	},
	component: ShareTarget,
});
