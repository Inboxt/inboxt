import { useFragment, useMutation, useQuery } from '@apollo/client';
import { Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useEffect, useState } from 'react';

import { SelectableLabel } from '~components/SelectableLabel';
import {
	ENTRIES,
	LABELS,
	SAVED_ITEM,
	SAVED_ITEM_LABELS_FRAGMENT,
	SET_SAVED_ITEM_LABELS,
} from '~lib/graphql';
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
	const [setSavedItemLabels, { loading }] = useMutation(SET_SAVED_ITEM_LABELS, {
		refetchQueries: [pathname.startsWith('/r') ? SAVED_ITEM : ENTRIES],
	});

	useEffect(() => {
		if (complete) {
			setValue((itemLabels.labels || []).map((label) => label.id));
		}
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
			) : (
				<Text size="sm" c="dimmed">
					No labels available yet.
				</Text>
			)}

			<Group justify="space-between" mt="md">
				<Button variant="light" onClick={modals.openCreateLabelModal}>
					Create new
				</Button>

				<Button onClick={() => void handleSelection()} loading={loading}>
					Save & Close
				</Button>
			</Group>
		</Stack>
	);
};
