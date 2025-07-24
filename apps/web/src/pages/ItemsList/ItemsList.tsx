import { Alert, Button, Center, Group, Stack, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';

import classes from './ItemsList.module.css';

import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ReaderItem } from '../../components/ReaderItem';
import { Route } from '../../routes/_auth.index.tsx';
import { AppViews } from '../../constants';
import { AppLayout } from '../../layouts/AppLayout.tsx';
import { PERMANENTLY_DELETE_SAVED_ITEMS, SAVED_ITEMS } from '../../lib/graphql.ts';
import { modals } from '@modals/modals.ts';

export const ItemsList = () => {
	const { view } = useSearch({ from: Route.id });
	const status =
		view === AppViews.TRASH ? 'DELETED' : view === AppViews.ARCHIVE ? 'ARCHIVED' : 'ACTIVE';

	const { data, loading, error } = useQuery(SAVED_ITEMS, {
		variables: { query: { first: 20, status } },
		fetchPolicy: 'cache-and-network',
	});

	const [permanentlyDeleteSavedItems] = useMutation(PERMANENTLY_DELETE_SAVED_ITEMS, {
		refetchQueries: [SAVED_ITEMS],
	});

	// TODO: infinite scrolling - make sure this part also works with it
	const { setVisibleItems } = useReaderContext();
	useEffect(() => {
		if (data?.savedItems?.edges) {
			setVisibleItems(data.savedItems.edges.map(({ node }) => node));
		}
	}, [data?.savedItems]);

	const items = data?.savedItems?.edges || [];
	const handlePermanentlyDeleteSavedItems = async () => {
		const count = items.length;
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

		if (!confirmed) return;

		await permanentlyDeleteSavedItems({
			variables: { data: { ids: items.map((i) => i.node.id) } },
		});
	};

	return (
		<AppLayout>
			<Stack gap={0} className={classes.items}>
				{view === AppViews.TRASH && (
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
								onClick={handlePermanentlyDeleteSavedItems}
							>
								Empty Trash Now
							</Button>
						</Group>
					</Alert>
				)}

				{!loading && !error && items.length === 0 && (
					<Center py="lg">
						<Text c="dimmed" size="sm">
							No items found in this view.
						</Text>
					</Center>
				)}

				{items.length > 0 &&
					items.map(({ node }) => <ReaderItem key={node.id} item={node} />)}
			</Stack>
		</AppLayout>
	);
};
