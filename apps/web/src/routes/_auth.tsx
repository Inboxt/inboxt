import { Outlet, createFileRoute } from '@tanstack/react-router';

import { requireActiveUser } from '~utils/requireActiveUser.ts';

export const Route = createFileRoute('/_auth')({
	beforeLoad: requireActiveUser,
	component: () => <Outlet />,
});
