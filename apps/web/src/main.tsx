import '@mantine/core/styles.css';
import './main.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ModalsProvider } from '@mantine/modals';
import { ApolloProvider } from '@apollo/client';
import { MantineProvider } from '@mantine/core';

import { InstallModal } from '@modals/InstallModal';
import { LabelsModal } from '@modals/LabelsModal';
import { LabelsSelectionModal } from '@modals/LabelsSelectionModal';
import { PlanModal } from '@modals/PlanModal';
import { ProfileModal } from '@modals/ProfileModal';
import { CreateLabelModal } from '@modals/CreateLabelModal';
import { VerifyEmailModal } from '@modals/VerifyEmailModal';
import { NewslettersModal } from '@modals/NewslettersModal';
import { DeleteAccountModal } from '@modals/DeleteAccountModal';

import { routeTree } from './routeTree.gen';
import { theme } from './theme';
import { ReaderProvider } from './context/ReaderContext.tsx';

import { client } from './lib/apolloClient.ts';

export const router = createRouter({
	routeTree,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
	interface HistoryState {
		emailAddress?: string;
	}
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ApolloProvider client={client}>
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
								verifyEmail: VerifyEmailModal,
								newsletters: NewslettersModal,
								deleteAccount: DeleteAccountModal,
							}}
						>
							<RouterProvider router={router} />
						</ModalsProvider>
					</ReaderProvider>
				</MantineProvider>
			</ApolloProvider>
		</StrictMode>,
	);
}
