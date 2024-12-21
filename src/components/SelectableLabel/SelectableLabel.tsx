import { Checkbox, Group, Text } from '@mantine/core';
import { IconLabelImportantFilled } from '@tabler/icons-react';

type SelectableLabelProps = {
	label: { id: number; name: string; color: string };
};

// TODO: Whole component should be clickable
export const SelectableLabel = ({ label }: SelectableLabelProps) => {
	return (
		<Group py={4}>
			<IconLabelImportantFilled
				size={21}
				style={{
					color: `var(--mantine-color-${label.color})`,
				}}
			/>

			<Text flex={1}>{label.name}</Text>
			<Checkbox value={label.id.toString()} />
		</Group>
	);
};
