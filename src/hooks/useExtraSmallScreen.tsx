import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export const useExtraSmallScreen = (): boolean => {
	const theme = useMantineTheme();
	const isLargeScreen = useMediaQuery(
		`(min-width: ${theme.breakpoints.xs})`,
		false,
		{ getInitialValueInEffect: false },
	);

	return !!isLargeScreen;
};
