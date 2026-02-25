import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import '@mantine/core/styles.css';

import { AppThemeProvider } from '@inboxt/ui';

import { SavePopup } from '@/components/SavePopup';
import { getApiToken } from '@/utils/token';
import { getAppUrl } from '@/utils/url';

type View = 'loading' | 'save';

const App = () => {
	const [view, setView] = useState<View>('loading');
	const [activeJobId, setActiveJobId] = useState<string | null>(null);

	useEffect(() => {
		const checkToken = async () => {
			const token = await getApiToken();
			const url = await getAppUrl();
			if (token && url) {
				setView('save');
			} else {
				browser.runtime.openOptionsPage();
				window.close();
			}
		};
		void checkToken();
	}, []);

	const handleOpenSettings = () => {
		browser.runtime.openOptionsPage();
		window.close();
	};

	if (view === 'loading') {
		return null;
	}

	return (
		<SavePopup
			onOpenSettings={handleOpenSettings}
			existingJobId={activeJobId}
			onJobStarted={setActiveJobId}
		/>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppThemeProvider>
			<App />
		</AppThemeProvider>
	</React.StrictMode>,
);
