import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import { ReactNode, useEffect } from 'react';

import { theme } from './theme';

function ThemeColorUpdater() {
	const { colorScheme } = useMantineColorScheme();

	useEffect(() => {
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', colorScheme === 'dark' ? '#1a1b1e' : '#ffffff');
		}
	}, [colorScheme]);

	return null;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
	return (
		<MantineProvider theme={theme} defaultColorScheme="light">
			<ThemeColorUpdater />

			{children}
		</MantineProvider>
	);
}
