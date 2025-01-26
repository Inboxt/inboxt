import { Button, Checkbox, Group, Stack } from '@mantine/core';
import { useState } from 'react';

import { SelectableLabel } from '../../components/SelectableLabel';
import { ContextModalProps } from '@mantine/modals';

import { BACKEND_LABELS } from '../../constants/fake-backend.tsx';

export const LabelsSelectionModal = ({ id, context }: ContextModalProps) => {
	const [value, setValue] = useState<string[]>(['3']);

	return (
		<Stack>
			<Checkbox.Group value={value} onChange={setValue} mr={3}>
				<Stack gap="xs">
					{BACKEND_LABELS.map((label) => (
						<SelectableLabel label={label} />
					))}
				</Stack>
			</Checkbox.Group>

			<Group justify="flex-end" gap={0}>
				<Button
					variant="transparent"
					color="text"
					onClick={() => context.closeModal(id)}
				>
					Cancel
				</Button>
				<Button variant="transparent">OK</Button>
			</Group>
		</Stack>
	);
};
