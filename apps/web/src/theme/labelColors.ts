import { DEFAULT_THEME, MantineColor } from '@mantine/core';

import { APP_PRIMARY_COLOR } from '@inbox-reader/common';

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

export const labelColors = ['#373A40', APP_PRIMARY_COLOR, ...swatches];
