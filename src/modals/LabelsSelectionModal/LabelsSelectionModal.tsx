import { Button, Checkbox, Group, Stack } from '@mantine/core';
import { useState } from 'react';

import { SelectableLabel } from '../../components/SelectableLabel';
import { ContextModalProps } from '@mantine/modals';

const BACKEND_LABELS = [
	{
		id: 1,
		name: 'Reddit',
		color: 'gray-6',
	},
	{
		id: 2,
		name: 'Work Stuff',
		color: 'red-6',
	},
	{
		id: 3,
		name: 'Electronics',
		color: 'blue-6',
	},
	{
		id: 4,
		name: 'Listen',
		color: 'pink-6',
	},
];

export const LabelsSelectionModal = ({ id, context }: ContextModalProps) => {
	const [value, setValue] = useState<string[]>(['3']);

	return (
		<Stack>
			<Checkbox.Group value={value} onChange={setValue}>
				<Stack gap="xs">
					{BACKEND_LABELS.map((label) => (
						<SelectableLabel label={label} />
					))}
				</Stack>
			</Checkbox.Group>

			<Group justify="flex-end" gap={0}>
				<Button
					variant="transparent"
					color="black"
					onClick={() => context.closeModal(id)}
				>
					Cancel
				</Button>
				<Button variant="transparent">OK</Button>
			</Group>
		</Stack>
	);
};
