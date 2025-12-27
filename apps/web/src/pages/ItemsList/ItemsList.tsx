import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, Center, Group, Loader, Text } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ConfirmWithAlert } from '~components/ConfirmWithAlert';
import { toastSuccess } from '~components/Toast';
import { useContentSelection } from '~context/content-selection';
import { AppLayout } from '~layouts/AppLayout';
import { ENTRIES, EntrySortField, SortDirection, EMPTY_TRASH } from '~lib/graphql';
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

	const [emptyTrash] = useMutation(EMPTY_TRASH, {
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

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]);

	useEffect(() => {
		if (q || sort) {
			virtualizer.scrollToIndex(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [q, sort]);

	const handleEmptyTrash = async () => {
		const confirmed = await new Promise<boolean>((resolve) => {
			modals.openConfirmModal({
				title: 'Empty Trash',
				centered: true,
				children: (
					<ConfirmWithAlert
						lines={[
							'Are you sure you want to permanently delete all items in the trash?',
							'This action cannot be undone.',
						]}
					/>
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

		const result = await emptyTrash();
		const count = result.data?.emptyTrash?.count ?? 0;
		toastSuccess({
			title:
				count > 0
					? `${count} item${count === 1 ? '' : 's'} permanently deleted`
					: 'Trash is already empty',
		});
	};

	const hasDeletedItems = items.some((edge) => {
		const node = edge.node as { status?: string };
		return node.status === 'DELETED';
	});

	return (
		<AppLayout>
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

						<Button variant="transparent" size="compact-sm" onClick={handleEmptyTrash}>
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
				<Box
					className={classes.items}
					ref={parentRef}
					style={{ height: '100%', overflowY: 'auto' }}
				>
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
										<ItemRenderer item={items[index].node} />
									)}
								</Box>
							);
						})}
					</Box>
				</Box>
			)}
		</AppLayout>
	);
};
