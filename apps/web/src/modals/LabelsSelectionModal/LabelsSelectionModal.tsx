import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Button, Card, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useMemo, useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { SelectableLabel } from '~components/SelectableLabel';
import {
	ENTRIES,
	LABELS,
	SAVED_ITEM,
	SAVED_ITEM_LABELS_FRAGMENT,
	SET_SAVED_ITEM_LABELS,
	Label,
} from '~lib/graphql';
import { modals } from '~modals/modals';

type LabelState = 'checked' | 'unchecked' | 'indeterminate';

export const LabelsSelectionModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<{ itemIds: string[] }>) => {
	const pathname = window.location.pathname;
	const client = useApolloClient();
	const { data, loading: labelsLoading } = useQuery(LABELS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

	const initialStates = useMemo(() => {
		const states: Record<string, LabelState> = {};
		const items = innerProps.itemIds.map((itemId) =>
			client.readFragment({
				fragment: SAVED_ITEM_LABELS_FRAGMENT,
				id: `SavedItem:${itemId}`,
				fragmentName: 'SavedItemLabelsFragment',
			}),
		);

		if (!data?.labels) {
			return states;
		}

		data.labels.forEach((label: Label) => {
			const presentCount = items.filter((item: any) =>
				item?.labels?.some((l: any) => l.id === label.id),
			).length;

			if (presentCount === 0) {
				states[label.id] = 'unchecked';
			} else if (presentCount === items.length) {
				states[label.id] = 'checked';
			} else {
				states[label.id] = 'indeterminate';
			}
		});

		return states;
	}, [data, innerProps.itemIds, client]);

	const [currentStates, setCurrentStates] = useState<Record<string, LabelState>>({});
	const [initialized, setInitialized] = useState(false);

	if (Object.keys(initialStates).length > 0 && !initialized) {
		setCurrentStates(initialStates);
		setInitialized(true);
	}

	const [setSavedItemLabels, { loading }] = useMutation(SET_SAVED_ITEM_LABELS, {
		refetchQueries: [pathname.startsWith('/r') ? SAVED_ITEM : ENTRIES],
	});

	const handleSelection = async () => {
		const addLabelIds: string[] = [];
		const removeLabelIds: string[] = [];

		Object.entries(currentStates).forEach(([labelId, state]) => {
			const initialState = initialStates[labelId];
			if (state === initialState) {
				return;
			}

			if (state === 'checked') {
				addLabelIds.push(labelId);
			} else if (state === 'unchecked') {
				removeLabelIds.push(labelId);
			}
		});

		if (addLabelIds.length === 0 && removeLabelIds.length === 0) {
			context.closeModal(id);
			return;
		}

		await setSavedItemLabels({
			variables: {
				data: { ids: innerProps.itemIds, addLabelIds, removeLabelIds },
			},
		});
		context.closeModal(id);
	};

	const toggleLabel = (labelId: string) => {
		setCurrentStates((prev) => {
			const currentState = prev[labelId];
			let nextState: LabelState = 'checked';

			if (currentState === 'checked') {
				nextState = 'unchecked';
			} else if (currentState === 'unchecked') {
				nextState = 'checked';
			} else if (currentState === 'indeterminate') {
				nextState = 'checked';
			}

			return { ...prev, [labelId]: nextState };
		});
	};

	return (
		<Stack gap="xl">
			<ScrollArea.Autosize mah="60vh" type="auto">
				{labelsLoading && !data ? (
					<Stack gap="xs" mr="sm">
						<Skeleton height={42} />
						<Skeleton height={42} />
						<Skeleton height={42} />
					</Stack>
				) : data?.labels?.length ? (
					<Card mr="sm">
						<Stack gap="xs">
							{data.labels.map((label: Label) => (
								<SelectableLabel
									label={label}
									key={label.id}
									checked={currentStates[label.id] === 'checked'}
									indeterminate={currentStates[label.id] === 'indeterminate'}
									onChange={() => toggleLabel(label.id)}
								/>
							))}
						</Stack>
					</Card>
				) : (
					<Text size="sm" c="dimmed">
						No labels available yet.
					</Text>
				)}
			</ScrollArea.Autosize>

			<ButtonContainer>
				<Button variant="light" onClick={modals.openCreateLabelModal}>
					Create new
				</Button>

				<Button onClick={handleSelection} loading={loading}>
					Save & Close
				</Button>
			</ButtonContainer>
		</Stack>
	);
};
