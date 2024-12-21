import { Button, Stack } from '@mantine/core';
import { useState } from 'react';
import { ContextModalProps } from '@mantine/modals';

import { EditableLabelItem } from '../../components/EditableLabelItem';

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
