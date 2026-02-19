import '@mantine/core/styles.css';
import './main.css';

import { ApolloProvider } from '@apollo/client';
import { ModalsProvider } from '@mantine/modals';
import * as Sentry from '@sentry/react';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import { AppThemeProvider } from '@inboxt/ui';

import { ContentSelectionProvider } from '~context/content-selection';
import { client } from '~lib/graphql/client.ts';
import { fetchRuntimeConfig, runtimeConfig } from '~lib/runtime-config';
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
import { VerifyEmailModal } from '~modals/VerifyEmailModal';

import { router } from './router';

async function init() {
	await fetchRuntimeConfig();

	if (import.meta.env.PROD && runtimeConfig.webErrorsDsn) {
		Sentry.init({
			dsn: runtimeConfig.webErrorsDsn,
		});
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
}

void init();
