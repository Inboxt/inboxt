import '@mantine/core/styles.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';
import { theme } from './theme';
import { ReaderProvider } from './context/ReaderContext.tsx';
import { ModalsProvider } from '@mantine/modals';
import { InstallModal } from '@modals/InstallModal';
import { LabelsModal } from '@modals/LabelsModal';
import { LabelsSelectionModal } from '@modals/LabelsSelectionModal';
import { PlanModal } from '@modals/PlanModal';
import { ProfileModal } from '@modals/ProfileModal';
import { MantineProvider } from '@mantine/core';
import { CreateLabelModal } from '@modals/CreateLabelModal';

const router = createRouter({
	routeTree,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<MantineProvider theme={theme} defaultColorScheme="light">
				<ReaderProvider>
					<ModalsProvider
						modals={{
							install: InstallModal,
							labels: LabelsModal,
							labelsSelection: LabelsSelectionModal,
							plan: PlanModal,
							profile: ProfileModal,
							createLabel: CreateLabelModal,
						}}
					>
						<RouterProvider router={router} />
					</ModalsProvider>
				</ReaderProvider>
			</MantineProvider>
		</StrictMode>,
	);
}
