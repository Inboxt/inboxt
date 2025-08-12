import { DEFAULT_THEME, MantineColor } from '@mantine/core';

const colorNames: MantineColor[] = [
	'red',
	'pink',
	'grape',
	'violet',
	'indigo',
	'blue',
	'cyan',
	'teal',
	'green',
	'lime',
	'yellow',
	'orange',
];

const swatches = colorNames
	.map((name) => DEFAULT_THEME.colors[name]?.[7])
	.filter((color): color is string => Boolean(color));

export const labelColors = [
	DEFAULT_THEME.colors.dark[9],
	DEFAULT_THEME.colors.gray[9],
	...swatches,
];
