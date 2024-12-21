import { createTheme, Modal, virtualColor } from '@mantine/core';

import classes from './theme.module.css';

import { fontSizes } from './fontSizes.ts';
import { spacing } from './spacing.ts';

export const theme = createTheme({
	//fontFamily: '"Poppins", sans-serif',
	// colors: {
	// 	grayDark: [
	// 		'#1212',
	// 		'#f1f3f5',
	// 		'#e9ecef',
	// 		'#dee2e6',
	// 		'#ced4da',
	// 		'#adb5bd',
	// 		'#868e96',
	// 		'#495057',
	// 		'#343a40',
	// 		'#212529',
	// 	],
	// 	gray: virtualColor({
	// 		name: 'gray',
	// 		dark: 'grayDark',
	// 		light: 'gray',
	// 	}),
	// },
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
	},
});
