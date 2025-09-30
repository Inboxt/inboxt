import { Group, Stack, Text, Title, Radio, SimpleGrid, Box } from '@mantine/core';

import { READER_THEMES, ReaderTheme } from '@inbox-reader/common';

import { useReaderSettings } from '~hooks/useReaderSettings.tsx';

import classes from './FormReadingThemeSettings.module.css';

export const FormReadingThemeSettings = () => {
	const { theme, setReaderTheme } = useReaderSettings();

	const themeOptions: ReaderTheme[] = [
		'auto',
		...(Object.keys(READER_THEMES) as (keyof typeof READER_THEMES)[]),
	];

	const cards = themeOptions.map((value) => {
		const label = value.charAt(0).toUpperCase() + value.slice(1);
		const bg =
			value === 'auto'
				? 'linear-gradient(90deg, #ffffff 50%, #1A1B1E 50%)'
				: READER_THEMES[value].background;

		return (
			<Radio.Card className={classes.root} radius="sm" value={value} key={value}>
				<Group wrap="nowrap" align="flex-start">
					<Box bg={bg} className={classes.icon} />
					<Text className={classes.label}>{label}</Text>
				</Group>
			</Radio.Card>
		);
	});

	return (
		<Stack>
			<Title order={4} visibleFrom="xs">
				Theme
			</Title>

			<Radio.Group value={theme} onChange={(value) => setReaderTheme(value as ReaderTheme)}>
				<SimpleGrid cols={2} spacing="xxs">
					{cards}
				</SimpleGrid>
			</Radio.Group>
		</Stack>
	);
};
