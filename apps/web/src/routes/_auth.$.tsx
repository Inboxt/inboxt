import { createFileRoute } from '@tanstack/react-router';

import { UrlPathShareTarget } from '~pages/ShareTarget/UrlPathShareTarget';

export const Route = createFileRoute('/_auth/$')({
	component: UrlPathShareTarget,
});
