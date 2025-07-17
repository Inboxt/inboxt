import { Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { useFragment, useMutation, useQuery } from '@apollo/client';

import { modals } from '@modals/modals';

import { SelectableLabel } from '../../components/SelectableLabel';
import {
	LABELS,
	SAVED_ITEM,
	SAVED_ITEM_LABELS_FRAGMENT,
	SAVED_ITEMS,
	SET_SAVED_ITEM_LABELS,
} from '../../lib/graphql';

export const LabelsSelectionModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<{ itemId: string }>) => {
	const { data } = useQuery(LABELS);
	const { complete, data: itemLabels } = useFragment({
		fragment: SAVED_ITEM_LABELS_FRAGMENT,
		from: { __typename: 'SavedItem', id: innerProps.itemId },
		fragmentName: 'SavedItemLabelsFragment',
	});

	const [value, setValue] = useState<string[]>([]);
	const [setSavedItemLabels, { loading }] = useMutation(SET_SAVED_ITEM_LABELS, {
		refetchQueries: [SAVED_ITEMS, SAVED_ITEM],
	});

	useEffect(() => {
		if (complete && itemLabels) setValue((itemLabels.labels || []).map((label) => label.id));
	}, [itemLabels, complete]);

	const handleSelection = async () => {
		await setSavedItemLabels({
			variables: {
				data: { id: innerProps.itemId, labelIds: value },
			},
		});
		context.closeModal(id);
	};

	return (
		<Stack>
			{data?.labels?.length ? (
				<Checkbox.Group value={value} onChange={setValue} mr={3}>
					<Stack gap="xs">
						{data.labels.map((label) => (
							<SelectableLabel label={label} key={label.id} />
						))}
					</Stack>
				</Checkbox.Group>
			) : (
				<Text size="sm" c="dimmed">
					No labels available yet.
				</Text>
			)}

			<Group justify="space-between" mt="md">
				<Button variant="light" onClick={modals.openCreateLabelModal}>
					Create new
				</Button>

				<Button onClick={handleSelection} loading={loading}>
					Save & Close
				</Button>
			</Group>
		</Stack>
	);
};
