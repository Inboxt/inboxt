import { useQuery } from '@apollo/client';
import { Button, Card, ScrollArea, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useEffect, useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { EditableLabelItem } from '~components/EditableLabelItem';
import { LABELS } from '~lib/graphql';
import { modals } from '~modals/modals';

export const LabelsModal = ({ id, context }: ContextModalProps) => {
	const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
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
	}, [editingLabelId, id, context]);

	const labels = data?.labels ?? [];
	const hasLabels = labels.length > 0;

	return (
		<Stack gap="xl">
			<ScrollArea.Autosize mah="50vh" type="auto">
				{hasLabels ? (
					<Card mr="sm">
						<Stack gap="sm">
							{labels.map((label) => (
								<EditableLabelItem
									key={label.id}
									label={label}
									isEditing={editingLabelId === label.id}
									setIsEditing={(isEditing) =>
										setEditingLabelId(isEditing ? label.id : null)
									}
								/>
							))}
						</Stack>
					</Card>
				) : (
					<Text size="sm" c="dimmed">
						No labels yet.
					</Text>
				)}
			</ScrollArea.Autosize>

			<ButtonContainer>
				<Button onClick={() => context.closeModal(id)} variant="default">
					Close
				</Button>

				<Button onClick={modals.openCreateLabelModal}>Create Label</Button>
			</ButtonContainer>
		</Stack>
	);
};
