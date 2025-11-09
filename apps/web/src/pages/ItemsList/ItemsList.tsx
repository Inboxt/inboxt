import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toastSuccess } from '~components/Toast';
import { useContentSelection } from '~context/content-selection';
import { AppLayout } from '~layouts/AppLayout';
import { PERMANENTLY_DELETE_SAVED_ITEMS, ENTRIES } from '~lib/graphql';
import { EntrySortField, SortDirection } from '~lib/graphql/generated/graphql.ts';
import { modals } from '~modals/modals';
import { Route } from '~routes/_auth.index';

import { ItemRenderer } from './ItemRenderers';
import classes from './ItemsList.module.css';

export const ItemsList = () => {
	const { q, sort } = useSearch({ from: Route.id });

	const [field, dir] = (sort?.split('_') ?? 'date_desc') as [string, string];
	const direction = dir === 'asc' ? SortDirection.Asc : SortDirection.Desc;
	const baseQuery = useMemo(
		() => ({
			q,
			first: 20,
			sort: {
				field: field === 'date' ? EntrySortField.CreatedAt : (field as EntrySortField),
				direction,
			},
		}),
		[q, field, direction],
	);

	const { data, loading, error, fetchMore, variables } = useQuery(ENTRIES, {
		variables: { query: baseQuery },
		notifyOnNetworkStatusChange: true,
		fetchPolicy: 'cache-and-network',
	});

	const [permanentlyDeleteSavedItems] = useMutation(PERMANENTLY_DELETE_SAVED_ITEMS, {
		refetchQueries: [ENTRIES],
	});

	const items = data?.entries.edges || [];
	const hasNextPage = data?.entries.pageInfo.hasNextPage ?? false;
	const endCursor = data?.entries.pageInfo.endCursor;

	const parentRef = useRef<HTMLDivElement | null>(null);
	const count = items.length + (hasNextPage ? 1 : 0);
	const virtualizer = useVirtualizer({
		count,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 110,
		overscan: 5,
	});
	const virtualItems = virtualizer.getVirtualItems();

	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const loadMore = useCallback(async () => {
		if (isFetchingMore || !hasNextPage || !endCursor) {
			return;
		}

		setIsFetchingMore(true);
		try {
			await fetchMore({
				variables: {
					query: { ...(variables?.query ?? baseQuery), after: endCursor },
				},
			});
		} finally {
			setIsFetchingMore(false);
		}
	}, [isFetchingMore, hasNextPage, endCursor, fetchMore, variables?.query, baseQuery]);

	useEffect(() => {
		if (virtualItems.length === 0) {
			return;
		}

		const last = virtualItems[virtualItems.length - 1];
		if (last && last.index >= items.length) {
			void loadMore();
		}
	}, [virtualItems, items.length, loadMore]);

	const { setVisibleItems } = useContentSelection();
	useEffect(() => {
		if (!items.length) {
			return;
		}

		const itemsNode = items.map((i) => i.node);
		setVisibleItems(itemsNode);
	}, [items]);

	useEffect(() => {
		if (q || sort) {
			virtualizer.scrollToIndex(0);
		}
	}, [q, sort]);

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

		// todo: delete all in trash not only ones that are currently visible on frontend
		await permanentlyDeleteSavedItems({
			variables: { data: { ids: savedItemIds } },
		});

		toastSuccess({
			title:
				count > 1
					? `${count} items were deleted permanently`
					: 'Item was deleted permanently',
		});
	};

	const hasDeletedItems = items.some((edge) => {
		const node = edge.node as { status?: string };
		return node.status === 'DELETED';
	});

	return (
		<AppLayout>
			<Stack gap={0} className={classes.items} ref={parentRef}>
				{hasDeletedItems && (
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

				{items.length > 0 && (
					<Box pos="relative" h={virtualizer.getTotalSize()}>
						{virtualItems.map((virtualRow) => {
							const index = virtualRow.index;
							const isLoaderRow = index >= items.length;
							return (
								<Box
									key={virtualRow.key}
									pos="absolute"
									top={0}
									left={0}
									w="100%"
									style={{
										transform: `translateY(${virtualRow.start}px)`,
									}}
									ref={virtualizer.measureElement}
									data-index={index}
								>
									{isLoaderRow ? (
										<Center py="md">
											<Loader size="sm" />
										</Center>
									) : (
										<ItemRenderer item={items[index]!.node} />
									)}
								</Box>
							);
						})}
					</Box>
				)}
			</Stack>
		</AppLayout>
	);
};
