import React from 'react';
import ReactDOM from 'react-dom/client';

import '@mantine/core/styles.css';

import { AppThemeProvider } from '@inboxt/ui';

import { SavePopup } from './SavePopup.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppThemeProvider>
			<SavePopup />
		</AppThemeProvider>
	</React.StrictMode>,
);
