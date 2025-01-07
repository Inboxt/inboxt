import { Checkbox, CheckboxProps, useComputedColorScheme } from '@mantine/core';

import classes from './ReaderCheckbox.module.css';

export const ReaderCheckbox = (props: CheckboxProps) => {
	const computedColorScheme = useComputedColorScheme();
	return (
		<Checkbox
			{...props}
			variant="outline"
			color={computedColorScheme === 'dark' ? 'gray' : 'dark'}
			classNames={{
				input: classes.checkbox,
			}}
		/>
	);
};
