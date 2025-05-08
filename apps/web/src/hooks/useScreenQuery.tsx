import { MantineBreakpoint, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export const useScreenQuery = (
	breakpoint: MantineBreakpoint,
	query: 'above' | 'below',
): boolean => {
	const theme = useMantineTheme();
	const mediaQuery = query === 'above' ? 'min-width' : 'max-width';
	const screenSize = useMediaQuery(`(${mediaQuery}: ${theme.breakpoints[breakpoint]})`, false, {
		getInitialValueInEffect: false,
	});

	return !!screenSize;
};
