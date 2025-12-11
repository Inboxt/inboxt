import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';

import '@mantine/core/styles.css';

import { AppThemeProvider } from '@inboxt/ui';

import { SavePopup } from './SavePopup.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<AppThemeProvider>
				<SavePopup />
			</AppThemeProvider>
		</ApolloProvider>
	</React.StrictMode>,
);
