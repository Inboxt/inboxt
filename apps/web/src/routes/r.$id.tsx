import { createFileRoute } from '@tanstack/react-router';

import { ReaderView } from '~pages/ReaderView';
import { requireActiveUser } from '~utils/requireActiveUser.ts';

export const Route = createFileRoute('/r/$id')({
	component: ReaderView,
	beforeLoad: requireActiveUser,
});
