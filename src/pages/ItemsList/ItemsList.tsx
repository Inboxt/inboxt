import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import classes from './ItemsList.module.css';

import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ReaderItem } from '../../components/ReaderItem';
import { Route } from '../../routes';
import { AppViews } from '../../constants';
import { AppLayout } from '../../layouts/AppLayout.tsx';

import { BACKEND_ARTICLES } from '../../constants/fake-backend.ts';

export const ItemsList = () => {
	const { view } = useSearch({ from: Route.fullPath });

	const { setVisibleItemIds } = useReaderContext();
	// TODO: This also probably doesn't handle well or at all infinite scrolling
	useEffect(() => {
		if (BACKEND_ARTICLES) {
			const visibleIds = BACKEND_ARTICLES.map((item) => item.id);
			setVisibleItemIds(visibleIds);
		}
	}, [BACKEND_ARTICLES]);

	return (
		<AppLayout>
			<Stack gap={0} className={classes.items}>
				{view === AppViews.TRASH && (
					<Alert
						variant="light"
						color="blue"
						fz="xxs"
						radius={0}
						className={classes.trashAlert}
					>
						<Group gap={0} justify="center">
							<Text ta="center">
								Items in Trash will be automatically deleted
								after 30 days.
							</Text>

							<Button variant="transparent" size="compact-sm">
								Empty Trash Now
							</Button>
						</Group>
					</Alert>
				)}

				{BACKEND_ARTICLES.map((article) => (
					<ReaderItem
						id={article.id}
						title={article.title}
						receivedAt={article.receivedAt}
						description={article?.description}
						labels={article?.labels}
						author={article.author}
					/>
				))}
			</Stack>
		</AppLayout>
	);
};
