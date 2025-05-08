import { Group, Stack, Text, Title, Radio, SimpleGrid, Box } from '@mantine/core';

import classes from './FormReadingThemeSettings.module.css';

// todo: move to an enum?
const readerThemes = [
	{
		name: 'Auto',
		colors: {
			background: 'auto',
			text: 'auto',
			highlights: '#FFF9B0',
		},
	},
	{
		name: 'Light',
		colors: {
			background: '#fff',
			text: 'red',
			highlights: '#FFF9B0',
		},
	},
	{
		name: 'Dark',
		colors: {
			background: '#1A1B1E',
			text: 'red',
			highlights: '#FFF9B0',
		},
	},
	{
		name: 'Sepia',
		colors: {
			background: '#f4ecd8',
			text: 'red',
			highlights: '#FFF9B0',
		},
	},
]; // todo: all colors in here because why not?

export const FormReadingThemeSettings = () => {
	const cards = readerThemes.map((item) => (
		<Radio.Card className={classes.root} radius="sm" value={item.name} key={item.name}>
			<Group wrap="nowrap" align="flex-start">
				<Box
					style={{
						background:
							item.colors.background === 'auto'
								? 'linear-gradient(90deg, #fff 50%, #1A1B1E 50%)'
								: item.colors.background,
					}}
					className={classes.icon}
				/>
				<Text className={classes.label}>{item.name}</Text>
			</Group>
		</Radio.Card>
	));

	return (
		<Stack>
			<Title order={4} visibleFrom="xs">
				Theme
			</Title>

			<Radio.Group>
				<SimpleGrid cols={2} spacing="xxs">
					{cards}
				</SimpleGrid>
			</Radio.Group>
		</Stack>
	);
};
