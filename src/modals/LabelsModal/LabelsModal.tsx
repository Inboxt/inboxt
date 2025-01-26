import { Button, Stack } from '@mantine/core';
import { useState } from 'react';
import { ContextModalProps } from '@mantine/modals';

import { EditableLabelItem } from '../../components/EditableLabelItem';

import { BACKEND_LABELS } from '../../constants/fake-backend';

// todo: option to create new label :)
export const LabelsModal = ({ id, context }: ContextModalProps) => {
	const [editingLabel, setEditingLabel] = useState<number | null>(null); // Tracks which label is being edited

	const handleEditStart = (labelId: number) => {
		setEditingLabel(labelId);
	};

	const handleEditSave = (
		labelId: number,
		updatedLabel: { name: string; color: string },
	) => {
		// TODO: Add save logic here
		console.log('Saved label:', labelId, updatedLabel);
		setEditingLabel(null);
	};

	const handleEditCancel = () => {
		setEditingLabel(null);
	};

	return (
		<Stack>
			<Stack gap="xs">
				{BACKEND_LABELS.map((label) => (
					<EditableLabelItem
						key={label.id}
						label={label}
						isEditing={editingLabel === label.id}
						onEditStart={() => handleEditStart(label.id)}
						onEditSave={handleEditSave}
						onEditCancel={handleEditCancel}
					/>
				))}
			</Stack>

			<Button onClick={() => context.closeModal(id)} ml="auto">
				Save & Close
			</Button>
		</Stack>
	);
};
