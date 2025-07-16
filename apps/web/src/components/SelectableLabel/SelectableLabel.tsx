import { Checkbox, Group, Text } from '@mantine/core';
import { IconLabelImportantFilled } from '@tabler/icons-react';

import classes from './SelectableLabel.module.css';

type SelectableLabelProps = {
	label: { id: number; name: string; color: string };
};

export const SelectableLabel = ({ label }: SelectableLabelProps) => {
	return (
		<label className={classes.selectableLabel}>
			<Group wrap="nowrap" className={classes.selectableLabelGroup}>
				<IconLabelImportantFilled size={21} style={{ color: label.color }} />
				<Text className={classes.selectableLabelText}>{label.name}</Text>
			</Group>

			<Checkbox value={label.id.toString()} ml="auto" onClick={(e) => e.stopPropagation()} />
		</label>
	);
};
