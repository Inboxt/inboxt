import { useMutation, useQuery } from '@apollo/client';
import { Alert, Button, Center, Group, Stack, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { AppViews } from '@inbox-reader/common';

import { useContentSelection } from '~context/content-selection';
import { AppLayout } from '~layouts/AppLayout';
import { PERMANENTLY_DELETE_SAVED_ITEMS, ENTRIES } from '~lib/graphql';
import { modals } from '~modals/modals';
import { Route } from '~routes/_auth.index';
import { entriesQueryBuilder } from '~utils/entriesQueryBuilder.ts';
import { extractLabelName } from '~utils/extractLabelName';
import { findLabelIdByName } from '~utils/findLabelIdByName';
import { fromKebabCase } from '~utils/fromKebabCase';

import { ItemRenderer } from './ItemRenderers';
import classes from './ItemsList.module.css';

export const ItemsList = () => {
	const { view, sort } = useSearch({ from: Route.id });

	const safeView = view ?? AppViews.INBOX;
	const labelName = safeView.startsWith('label:') ? extractLabelName(safeView) : null;
	const labelId = labelName ? findLabelIdByName(fromKebabCase(labelName)) : undefined;

	const variables = entriesQueryBuilder(safeView, { pageSize: 20, sort, labelId });
	const { data, loading, error } = useQuery(ENTRIES, {
		variables,
		fetchPolicy: 'cache-and-network',
	});

	const [permanentlyDeleteSavedItems] = useMutation(PERMANENTLY_DELETE_SAVED_ITEMS, {
		refetchQueries: [ENTRIES],
	});

	// TODO: infinite scrolling - make sure this part also works with it
	const { setVisibleItems } = useContentSelection();
	useEffect(() => {
		if (data?.entries.edges.length) {
			setVisibleItems(data.entries.edges.map(({ node }) => node));
		}
	}, [data?.entries]);

	const items = data?.entries.edges || [];

	const handlePermanentlyDeleteSavedItems = async () => {
		const savedItemIds = items
			.filter(({ node }) => node.__typename === 'SavedItem')
			.map(({ node }) => node.id);

		if (savedItemIds.length === 0) {
			return;
		}

		const count = savedItemIds.length;
		const confirmed = await new Promise<boolean>((resolve) => {
			modals.openConfirmModal({
				title: 'Delete Permanently',
				centered: true,
				children: (
					<Text>
						Are you sure you want to permanently delete{' '}
						{count > 1 ? `${count} items` : 'this item'}? <br />
						This action cannot be undone.
					</Text>
				),
				labels: { confirm: 'Delete permanently', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				onConfirm: () => resolve(true),
				onCancel: () => resolve(false),
			});
		});

		if (!confirmed) {
			return;
		}

		await permanentlyDeleteSavedItems({
			variables: { data: { ids: savedItemIds } },
		});
	};

	return (
		<AppLayout>
			<Stack gap={0} className={classes.items}>
				{safeView === AppViews.TRASH && (
					<Alert
						variant="light"
						color="yellow"
						fz="xxs"
						radius={0}
						className={classes.trashAlert}
						p="xxs"
					>
						<Group gap={0} justify="center">
							<Text ta="center">
								Items in Trash will be automatically deleted after 30 days.
							</Text>

							<Button
								variant="transparent"
								size="compact-sm"
								onClick={() => void handlePermanentlyDeleteSavedItems()}
							>
								Empty Trash Now
							</Button>
						</Group>
					</Alert>
				)}

				{!loading && !error && items.length === 0 && (
					<Center py="lg">
						<Text c="dimmed" size="sm">
							No items found.
						</Text>
					</Center>
				)}

				{items.length > 0 &&
					items.map(({ node }) => <ItemRenderer key={node.id} item={node} />)}
			</Stack>
		</AppLayout>
	);
};
