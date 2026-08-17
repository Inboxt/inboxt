import { useMutation, useQuery } from '@apollo/client/react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useEffect, useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { EditableLabelItem } from '~components/EditableLabelItem';
import { LABELS, REORDER_LABELS } from '~lib/graphql';
import { modals } from '~modals/modals';

export const LabelsModal = ({ id, context }: ContextModalProps) => {
	const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
	const { data, loading } = useQuery(LABELS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

	const [reorderLabels] = useMutation(REORDER_LABELS, {
		update: (cache, { data }) => {
			if (data?.reorderLabels) {
				cache.writeQuery({
					query: LABELS,
					data: { labels: data.reorderLabels },
				});
			}
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

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

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = labels.findIndex((l) => l.id === active.id);
			const newIndex = labels.findIndex((l) => l.id === over.id);

			const newOrder = arrayMove(labels, oldIndex, newIndex);
			const ids = newOrder.map((l) => l.id);

			await reorderLabels({
				variables: { data: { ids } },
				optimisticResponse: {
					reorderLabels: newOrder.map((l, index) => ({
						__typename: 'Label',
						...l,
						order: index,
					})),
				},
			});
		}
	};

	return (
		<Stack gap="xl" flex={1} h="100%" mih={0} style={{ overflow: 'hidden' }}>
			<ScrollArea.Autosize
				flex={1}
				mih={0}
				mah={{ base: '100%', sm: '50vh' }}
				type="auto"
				scrollbars="y"
			>
				{loading && !data ? (
					<Stack gap="xs" pr="sm">
						<Skeleton height={50} />
						<Skeleton height={50} />
						<Skeleton height={50} />
					</Stack>
				) : hasLabels ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
						modifiers={[restrictToVerticalAxis]}
					>
						<SortableContext items={labels} strategy={verticalListSortingStrategy}>
							<Stack gap="sm" pr="sm">
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
						</SortableContext>
					</DndContext>
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
