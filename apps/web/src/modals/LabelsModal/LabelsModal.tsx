import { Button, Group, Stack } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useQuery } from '@apollo/client';

import { modals } from '@modals/modals.ts';

import { EditableLabelItem } from '../../components/EditableLabelItem';
import { LABELS } from '../../lib/graphql.ts';
import { useEffect, useState } from 'react';

export const LabelsModal = ({ id, context }: ContextModalProps) => {
	const [editingLabelId, setEditingLabelId] = useState<number | null>(null);
	const { data } = useQuery(LABELS);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				if (editingLabelId !== null) {
					setEditingLabelId(null);
				} else {
					context.closeModal(id);
				}
			}
		};
		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [editingLabelId]);

	return (
		<Stack>
			<Stack gap="sm">
				{data?.labels?.map((label) => (
					<EditableLabelItem
						key={label.id}
						label={label}
						isEditing={editingLabelId === label.id}
						setIsEditing={(isEditing) => setEditingLabelId(isEditing ? label.id : null)}
					/>
				))}
			</Stack>

			<Group justify="flex-end">
				<Button variant="light" color="text" onClick={modals.openCreateLabelModal}>
					Create new
				</Button>

				<Button onClick={() => context.closeModal(id)}>Save & Close</Button>
			</Group>
		</Stack>
	);
};
