import { createRootRoute, Outlet } from '@tanstack/react-router';

import { AppError, NotFound } from '~pages/StatusPage.tsx';

export const Route = createRootRoute({
	component: () => <Outlet />,
	errorComponent: ({ error }) => <AppError error={error} />,
	notFoundComponent: () => <NotFound />,
});
