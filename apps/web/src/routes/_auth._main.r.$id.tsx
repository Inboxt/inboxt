import { createFileRoute } from '@tanstack/react-router';

import { ReaderView } from '~pages/ReaderView';

export const Route = createFileRoute('/_auth/_main/r/$id')({
	component: ReaderView,
});
