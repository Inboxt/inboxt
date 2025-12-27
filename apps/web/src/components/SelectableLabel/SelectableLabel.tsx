import { Checkbox, Group, Text } from '@mantine/core';
import { IconLabelImportantFilled } from '@tabler/icons-react';

import { Label } from '~lib/graphql';

import classes from './SelectableLabel.module.css';

type SelectableLabelProps = {
	label: Pick<Label, 'id' | 'name' | 'color'>;
};

export const SelectableLabel = ({ label }: SelectableLabelProps) => {
	return (
		<label className={classes.selectableLabel}>
			<Group wrap="nowrap" className={classes.selectableLabelGroup}>
				<IconLabelImportantFilled size={21} style={{ color: label.color }} />
				<Text className={classes.selectableLabelText}>{label.name}</Text>
			</Group>

			<Checkbox value={label.id} ml="auto" onClick={(e) => e.stopPropagation()} />
		</label>
	);
};
