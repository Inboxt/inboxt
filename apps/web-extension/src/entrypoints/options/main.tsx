import { Center } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { AppThemeProvider } from '@inboxt/ui';

import '@mantine/core/styles.css';

import { ApiTokenSettings } from '@/components/ApiTokenSettings';
import { ApiTokenSetup } from '@/components/ApiTokenSetup';
import { getApiToken } from '@/utils/token';
import { getAppUrl } from '@/utils/url';

const Options = () => {
	const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

	const checkConfig = async () => {
		const token = await getApiToken();
		const url = await getAppUrl();
		setIsConfigured(!!(token && url));
	};

	useEffect(() => {
		void checkConfig();
	}, []);

	if (isConfigured === null) {
		return null;
	}

	return (
		<Center style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
			{isConfigured ? (
				<ApiTokenSettings />
			) : (
				<ApiTokenSetup onTokenSaved={() => setIsConfigured(true)} />
			)}
		</Center>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppThemeProvider>
			<Options />
		</AppThemeProvider>
	</React.StrictMode>,
);
