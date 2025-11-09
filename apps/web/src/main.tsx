import '@mantine/core/styles.css';
import './main.css';

import { ApolloProvider } from '@apollo/client';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import { ContentSelectionProvider } from '~context/content-selection';
import { client } from '~lib/graphql/client';
import { AddContentModal } from '~modals/AddContentModal';
import { CreateLabelModal } from '~modals/CreateLabelModal';
import { DeleteAccountModal } from '~modals/DeleteAccountModal';
import { EmailsModal } from '~modals/EmailsModal/EmailsModal';
import { ExportDataModal } from '~modals/ExportDataModal';
import { ImportModal } from '~modals/ImportModal';
import { InstallModal } from '~modals/InstallModal';
import { LabelsModal } from '~modals/LabelsModal';
import { LabelsSelectionModal } from '~modals/LabelsSelectionModal';
import { ProfileModal } from '~modals/ProfileModal';
import { VerifyEmailModal } from '~modals/VerifyEmailModal';

import { routeTree } from './routeTree.gen';
import { theme } from './theme';

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

declare module '@tanstack/history' {
	interface HistoryState {
		emailAddress: string;
	}
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ApolloProvider client={client}>
				<MantineProvider theme={theme} defaultColorScheme="light">
					<ContentSelectionProvider>
						<ModalsProvider
							modals={{
								install: InstallModal,
								labels: LabelsModal,
								labelsSelection: LabelsSelectionModal,
								profile: ProfileModal,
								createLabel: CreateLabelModal,
								verifyEmail: VerifyEmailModal,
								emails: EmailsModal,
								deleteAccount: DeleteAccountModal,
								addContent: AddContentModal,
								exportData: ExportDataModal,
								import: ImportModal,
							}}
						>
							<RouterProvider router={router} />
							<Toaster position="bottom-left" />
						</ModalsProvider>
					</ContentSelectionProvider>
				</MantineProvider>
			</ApolloProvider>
		</StrictMode>,
	);
}
