import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export const useLargeScreen = (): boolean => {
	const theme = useMantineTheme();
	const isLargeScreen = useMediaQuery(
		`(min-width: ${theme.breakpoints.lg})`,
		false,
		{
			getInitialValueInEffect: false,
		},
	);

	return !!isLargeScreen;
};
