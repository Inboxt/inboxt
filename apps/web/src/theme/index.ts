import { Checkbox, createTheme, Modal, SegmentedControl } from '@mantine/core';

import { fontSizes } from './fontSizes';
import { spacing } from './spacing';
import classes from './theme.module.css';

export const theme = createTheme({
	//fontFamily: '"Poppins", sans-serif',
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
	},
	fontSizes,
	spacing,
	// headings,
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
	},
});
