import { useMutation, useQuery } from '@apollo/client';
import { Alert, Button, Center, Group, Stack, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';

import { AppViews } from '@inbox-reader/common';

import { useReaderContext } from '~context/reader';
import { AppLayout } from '~layouts/AppLayout';
import { PERMANENTLY_DELETE_SAVED_ITEMS, SAVED_ITEMS } from '~lib/graphql';
import { SavedItem, SavedItemType } from '~lib/graphql/generated/graphql';
import { modals } from '~modals/modals';
import { Route } from '~routes/_auth.index';
import { extractLabelName } from '~utils/extractLabelName';
import { findLabelIdByName } from '~utils/findLabelIdByName';
import { fromKebabCase } from '~utils/fromKebabCase';
import { itemsQueryBuilder } from '~utils/itemsQueryBuilder';

import { ArticleRenderer, NewsletterRenderer } from './ItemRenderers';
import classes from './ItemsList.module.css';

export const ItemsList = () => {
	const { view, sort } = useSearch({ from: Route.id });

	const safeView = view ?? AppViews.INBOX;
	const labelName = safeView.startsWith('label:') ? extractLabelName(safeView) : null;
	const labelId = labelName ? findLabelIdByName(fromKebabCase(labelName)) : undefined;

	const variables = itemsQueryBuilder(safeView, { pageSize: 20, sort, labelId });
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
		if (data?.savedItems.edges.length) {
			setVisibleItems(data.savedItems.edges.map(({ node }) => node));
		}
	}, [data?.savedItems]);

	const items = data?.savedItems.edges || [];
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

		if (!confirmed) {
			return;
		}

		await permanentlyDeleteSavedItems({
			variables: { data: { ids: items.map((i) => i.node.id) } },
		});
	};

	const renderItem = (item: SavedItem) => {
		switch (variables.query.type) {
			case SavedItemType.Newsletter:
				return <NewsletterRenderer key={item.id} item={item} />;
			case SavedItemType.Article:
			default:
				return <ArticleRenderer key={item.id} item={item} />;
		}
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
							No items found in this safeView.
						</Text>
					</Center>
				)}

				{items.length > 0 && items.map(({ node }) => renderItem(node))}
			</Stack>
		</AppLayout>
	);
};
