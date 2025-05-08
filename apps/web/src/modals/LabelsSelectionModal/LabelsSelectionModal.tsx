import { Button, Checkbox, Group, Stack } from '@mantine/core';
import { useState } from 'react';

import { SelectableLabel } from '../../components/SelectableLabel';
import { ContextModalProps } from '@mantine/modals';

import { BACKEND_LABELS } from '../../constants/fake-backend';
import { modals } from '@modals/modals.ts';

export const LabelsSelectionModal = ({ id, context }: ContextModalProps) => {
	const [value, setValue] = useState<string[]>(['3']);

	const handleSelection = () => {
		// todo: call backend and save selected labels
		context.closeModal(id);
	};

	return (
		<Stack>
			<Checkbox.Group value={value} onChange={setValue} mr={3}>
				<Stack gap="xs">
					{BACKEND_LABELS.map((label) => (
						<SelectableLabel label={label} />
					))}
				</Stack>
			</Checkbox.Group>

			<Group justify="flex-end">
				<Button variant="light" color="text" onClick={modals.openCreateLabelModal}>
					Create new
				</Button>

				<Button onClick={handleSelection}>Save & Close</Button>
			</Group>
		</Stack>
	);
};
