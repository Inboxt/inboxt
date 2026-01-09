import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import '@mantine/core/styles.css';

import { AppThemeProvider } from '@inboxt/ui';

import { ApiTokenSettings } from '@/components/ApiTokenSettings';
import { ApiTokenSetup } from '@/components/ApiTokenSetup';
import { SavePopup } from '@/components/SavePopup';
import { getApiToken } from '@/utils/token';

type View = 'loading' | 'setup' | 'save' | 'settings';

const App = () => {
	const [view, setView] = useState<View>('loading');
	const [activeJobId, setActiveJobId] = useState<string | null>(null);

	useEffect(() => {
		const checkToken = async () => {
			const token = await getApiToken();
			setView(token ? 'save' : 'setup');
		};
		void checkToken();
	}, []);

	const handleOpenSettings = () => {
		setView('settings');
	};

	const handleBackFromSettings = () => {
		setView('save');
	};

	if (view === 'loading') {
		return null;
	}

	if (view === 'setup') {
		return <ApiTokenSetup onTokenSaved={() => setView('save')} />;
	}

	if (view === 'settings') {
		return <ApiTokenSettings onBack={handleBackFromSettings} />;
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
