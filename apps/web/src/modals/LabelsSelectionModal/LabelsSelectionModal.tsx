import { useFragment, useMutation, useQuery } from '@apollo/client';
import { Button, Card, Checkbox, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';

import {
	ENTRIES,
	LABELS,
	SAVED_ITEM,
	SAVED_ITEM_LABELS_FRAGMENT,
	SET_SAVED_ITEM_LABELS,
} from '@inboxt/graphql';

import { ButtonContainer } from '~components/ButtonContainer';
import { SelectableLabel } from '~components/SelectableLabel';
import { modals } from '~modals/modals';

export const LabelsSelectionModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<{ itemId: string }>) => {
	const pathname = window.location.pathname;
	const { data } = useQuery(LABELS);
	const { complete, data: itemLabels } = useFragment({
		fragment: SAVED_ITEM_LABELS_FRAGMENT,
		from: { __typename: 'SavedItem', id: innerProps.itemId },
		fragmentName: 'SavedItemLabelsFragment',
	});

	const [value, setValue] = useState<string[]>([]);
	const [initialized, setInitialized] = useState(false);

	if (complete && !initialized) {
		setValue((itemLabels?.labels || []).map((label) => label.id));
		setInitialized(true);
	}

	const [setSavedItemLabels, { loading }] = useMutation(SET_SAVED_ITEM_LABELS, {
		refetchQueries: [pathname.startsWith('/r') ? SAVED_ITEM : ENTRIES],
	});

	const handleSelection = async () => {
		await setSavedItemLabels({
			variables: {
				data: { id: innerProps.itemId, labelIds: value },
			},
		});
		context.closeModal(id);
	};

	return (
		<Stack gap="xl">
			{data?.labels?.length ? (
				<Card>
					<Checkbox.Group
						value={value}
						onChange={setValue}
						mr={3}
						mah={300}
						className="overflow-container"
					>
						<Stack gap="xs">
							{data.labels.map((label) => (
								<SelectableLabel label={label} key={label.id} />
							))}
						</Stack>
					</Checkbox.Group>
				</Card>
			) : (
				<Text size="sm" c="dimmed">
					No labels available yet.
				</Text>
			)}

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
