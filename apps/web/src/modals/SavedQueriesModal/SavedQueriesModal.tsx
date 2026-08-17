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
import { EditableSavedQueryItem } from '~components/EditableSavedQueryItem';
import { REORDER_SAVED_QUERIES, SAVED_QUERIES } from '~lib/graphql';
import { modals } from '~modals/modals';

export const SavedQueriesModal = ({ id, context }: ContextModalProps) => {
	const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
	const { data, loading } = useQuery(SAVED_QUERIES, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

	const [reorderSavedQueries] = useMutation(REORDER_SAVED_QUERIES, {
		update: (cache, { data }) => {
			if (data?.reorderSavedQueries) {
				cache.writeQuery({
					query: SAVED_QUERIES,
					data: { savedQueries: data.reorderSavedQueries },
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
				if (editingQueryId !== null) {
					setEditingQueryId(null);
				} else {
					context.closeModal(id);
				}
			}
		};
		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [editingQueryId, id, context]);

	const queries = data?.savedQueries ?? [];
	const hasQueries = queries.length > 0;

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = queries.findIndex((q) => q.id === active.id);
			const newIndex = queries.findIndex((q) => q.id === over.id);

			const newOrder = arrayMove(queries, oldIndex, newIndex);
			const ids = newOrder.map((q) => q.id);

			await reorderSavedQueries({
				variables: { data: { ids } },
				optimisticResponse: {
					reorderSavedQueries: newOrder.map((q, index) => ({
						__typename: 'SavedQuery',
						...q,
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
						<Skeleton height={60} />
						<Skeleton height={60} />
						<Skeleton height={60} />
					</Stack>
				) : hasQueries ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
						modifiers={[restrictToVerticalAxis]}
					>
						<SortableContext items={queries} strategy={verticalListSortingStrategy}>
							<Stack gap="sm" pr="sm">
								{queries.map((query) => (
									<EditableSavedQueryItem
										key={query.id}
										query={query}
										isEditing={editingQueryId === query.id}
										setIsEditing={(isEditing) =>
											setEditingQueryId(isEditing ? query.id : null)
										}
									/>
								))}
							</Stack>
						</SortableContext>
					</DndContext>
				) : (
					<Text size="sm" c="dimmed">
						No saved queries yet.
					</Text>
				)}
			</ScrollArea.Autosize>

			<ButtonContainer>
				<Button onClick={() => context.closeModal(id)} variant="default">
					Close
				</Button>

				<Button onClick={() => modals.openCreateSavedQueryModal()}>Save Search</Button>
			</ButtonContainer>
		</Stack>
	);
};
