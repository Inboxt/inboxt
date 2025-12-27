import {
	Breadcrumbs,
	Card,
	Checkbox,
	createTheme,
	DefaultMantineColor,
	MantineColorsTuple,
	Modal,
	SegmentedControl,
} from '@mantine/core';

import { fontSizes } from './fontSizes';
import { spacing } from './spacing';

import classes from './theme.module.css';

type ExtendedCustomColors = 'primary' | DefaultMantineColor;

declare module '@mantine/core' {
	export interface MantineThemeColorsOverride {
		colors: Record<ExtendedCustomColors, MantineColorsTuple>;
	}
}

export const theme = createTheme({
	colors: {
		dark: [
			'#C1C2C5',
			'#A6A7AB',
			'#909296',
			'#5c5f66',
			'#373A40',
			'#2C2E33',
			'#25262b',
			'#1A1B1E',
			'#141517',
			'#101113',
		],
		primary: [
			'#e9fbf2',
			'#dcf0e6',
			'#bcdecd',
			'#99cab2',
			'#7cba9c',
			'#68b08d',
			'#55a57e',
			'#4b9672',
			'#3f8664',
			'#2f7454',
		],
	},
	fontSizes,
	spacing,
	primaryColor: 'primary',
	components: {
		Modal: Modal.extend({
			classNames: {
				header: classes.modalHeader,
				title: classes.modalTitle,
				close: classes.modalClose,
			},
		}),
		SegmentedControl: SegmentedControl.extend({
			classNames: {
				root: classes.segmentedControlRoot,
			},
		}),
		Checkbox: Checkbox.extend({ classNames: classes }),
		Card: Card.extend({
			defaultProps: {
				withBorder: true,
				radius: 'md',
			},
		}),
		Breadcrumbs: Breadcrumbs.extend({
			defaultProps: {
				separatorMargin: 6,
			},
		}),
	},
});
