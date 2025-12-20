import '@mantine/core/styles.css';
import './main.css';

import { ApolloProvider } from '@apollo/client';
import { ModalsProvider } from '@mantine/modals';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import { AppThemeProvider } from '@inboxt/ui';

import { ContentSelectionProvider } from '~context/content-selection';
import { AddContentModal } from '~modals/AddContentModal';
import { ApiTokensModal } from '~modals/ApiTokensModal';
import { CreateApiTokenModal } from '~modals/CreateApiTokenModal';
import { CreateLabelModal } from '~modals/CreateLabelModal';
import { DeleteAccountModal } from '~modals/DeleteAccountModal';
import { EmailsModal } from '~modals/EmailsModal/EmailsModal';
import { ExportDataModal } from '~modals/ExportDataModal';
import { ImportModal } from '~modals/ImportModal';
import { LabelsModal } from '~modals/LabelsModal';
import { LabelsSelectionModal } from '~modals/LabelsSelectionModal';
import { ProfileModal } from '~modals/ProfileModal';
import { StorageHelpModal } from '~modals/StorageHelpModal';
import { VerifyEmailModal } from '~modals/VerifyEmailModal';
import { client } from '~utils/client.ts';

import { routeTree } from './routeTree.gen';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ApolloProvider client={client}>
			<AppThemeProvider>
				<ContentSelectionProvider>
					<ModalsProvider
						modals={{
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
							storageHelp: StorageHelpModal,
							apiTokens: ApiTokensModal,
							createApiToken: CreateApiTokenModal,
						}}
					>
						<RouterProvider router={router} />
						<Toaster position="bottom-left" />
					</ModalsProvider>
				</ContentSelectionProvider>
			</AppThemeProvider>
		</ApolloProvider>
	</StrictMode>,
);
