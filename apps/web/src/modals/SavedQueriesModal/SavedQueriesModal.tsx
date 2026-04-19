import { useQuery } from '@apollo/client';
import { Button, Card, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useEffect, useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { EditableSavedQueryItem } from '~components/EditableSavedQueryItem';
import { SAVED_QUERIES } from '~lib/graphql';
import { modals } from '~modals/modals';

export const SavedQueriesModal = ({ id, context }: ContextModalProps) => {
	const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
	const { data, loading } = useQuery(SAVED_QUERIES, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

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

	return (
		<Stack gap="xl">
			<ScrollArea.Autosize mah="50vh" type="auto">
				{loading && !data ? (
					<Stack gap="xs" pr="sm">
						<Skeleton height={60} />
						<Skeleton height={60} />
						<Skeleton height={60} />
					</Stack>
				) : hasQueries ? (
					<Card pr="sm">
						<Stack gap="sm">
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
					</Card>
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
