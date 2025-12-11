import { MantineProvider } from '@mantine/core';
import { ReactNode } from 'react';

import { theme } from './theme';

export function AppThemeProvider({ children }: { children: ReactNode }) {
	return (
		<MantineProvider theme={theme} defaultColorScheme="light">
			{children}
		</MantineProvider>
	);
}
