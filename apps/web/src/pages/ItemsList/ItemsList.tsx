import { Alert, Button, Center, Group, Stack, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';

import classes from './ItemsList.module.css';

import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ReaderItem } from '../../components/ReaderItem';
import { Route } from '../../routes/_auth.index.tsx';
import { AppViews } from '../../constants';
import { AppLayout } from '../../layouts/AppLayout.tsx';
import { SAVED_ITEMS } from '../../lib/graphql.ts';

export const ItemsList = () => {
	const { view } = useSearch({ from: Route.id });
	const status =
		view === AppViews.TRASH ? 'DELETED' : view === AppViews.ARCHIVE ? 'ARCHIVED' : 'ACTIVE';

	const { data, loading, error } = useQuery(SAVED_ITEMS, {
		variables: { data: { first: 20, status } },
		fetchPolicy: 'cache-and-network',
	});

	// TODO: infinite scrolling - make sure this part also works with it
	const { setVisibleItems } = useReaderContext();
	useEffect(() => {
		if (data?.savedItems?.edges) {
			setVisibleItems(data.savedItems.edges.map(({ node }) => node));
		}
	}, [data?.savedItems]);

	const items = data?.savedItems?.edges || [];
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

							<Button variant="transparent" size="compact-sm">
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
