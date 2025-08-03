import { Alert, Button, Center, Group, Stack, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect } from 'react';

import classes from './ItemsList.module.css';

import { modals } from '@modals/modals.ts';

import { useReaderContext } from '../../context/ReaderContext.tsx';
import { Route } from '../../routes/_auth.index.tsx';
import { AppViews } from '../../constants';
import { AppLayout } from '../../layouts/AppLayout.tsx';
import { PERMANENTLY_DELETE_SAVED_ITEMS, SAVED_ITEMS } from '../../lib/graphql.ts';
import { itemsQueryBuilder } from '../../utils/itemsQueryBuilder.ts';
import { ArticleRenderer, NewsletterRenderer } from './ItemRenderers';
import { extractLabelName } from '../../utils/extractLabelName.ts';
import { findLabelIdByName } from '../../utils/findLabelIdByName.ts';
import { fromKebabCase } from '../../utils/fromKebabCase.ts';

export const ItemsList = () => {
	const { view, sort } = useSearch({ from: Route.id });

	const labelName = view.startsWith('label:') ? extractLabelName(view) : null;
	const labelId = labelName ? findLabelIdByName(fromKebabCase(labelName)) : undefined;

	const variables = itemsQueryBuilder(view, { pageSize: 20, sort, labelId });
	const { data, loading, error } = useQuery(SAVED_ITEMS, {
		variables,
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

	const renderItem = (item: Record<string, unknown>) => {
		switch (variables.query.type) {
			case 'NEWSLETTER':
				return <NewsletterRenderer key={item.id} item={item} />;
			case 'ARTICLE':
			default:
				return <ArticleRenderer key={item.id} item={item} />;
		}
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

				{items.length > 0 && items.map(({ node }) => renderItem(node))}
			</Stack>
		</AppLayout>
	);
};
