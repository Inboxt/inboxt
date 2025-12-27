import { createRootRoute, Outlet } from '@tanstack/react-router';

import { AppError } from '~pages/AppError.tsx';
import { NotFound } from '~pages/NotFound.tsx';

export const Route = createRootRoute({
	component: () => <Outlet />,
	errorComponent: ({ error }) => <AppError error={error} />,
	notFoundComponent: () => <NotFound />,
});
