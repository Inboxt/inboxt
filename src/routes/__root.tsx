import { createRootRoute } from '@tanstack/react-router';
import { RootLayout } from '../layouts/RootLayout.tsx';

export const Route = createRootRoute({
	component: () => <RootLayout />,
});
