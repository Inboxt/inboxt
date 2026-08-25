import { useSearch } from '@tanstack/react-router';

import { Route } from '~routes/_auth.share-target.tsx';

import { ItemFromUrlProcessor } from './ItemFromUrlProcessor';

export const ShareTarget = () => {
	const { url, text } = useSearch({ from: Route.id });
	const targetUrl = url || (text && text.startsWith('http') ? text : null);

	return <ItemFromUrlProcessor url={targetUrl} />;
};
