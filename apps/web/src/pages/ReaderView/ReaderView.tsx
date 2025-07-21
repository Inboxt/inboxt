import {
	ActionIcon,
	Anchor,
	Badge,
	Box,
	Breadcrumbs,
	Center,
	Divider,
	Flex,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
	TypographyStylesProvider,
} from '@mantine/core';
import { useCanGoBack, useNavigate, useParams, useRouter } from '@tanstack/react-router';
import { IconArrowLeft, IconHighlight, IconHighlightOff } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useDocumentTitle } from '@mantine/hooks';
import { useQuery } from '@apollo/client';

import classes from './ReaderView.module.css';
import { AppName } from '../../components/AppName';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { ReaderSettingsOptions } from '../../components/ReaderSettingsOptions';
import { Route } from '../../routes/r.$id.tsx';

import { useTextHighlighting } from '../../hooks/useTextSelection.tsx';
import { HighlightableArticle } from '../../components/HighlightableArticle';
import { SAVED_ITEM } from '../../lib/graphql.ts';

export const ReaderView = () => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const navigate = useNavigate({ from: Route.fullPath });

	const { selectedText, highlightSelection, isFullyHighlighted } = useTextHighlighting();
	const hasSelection = Boolean(selectedText);

	const { id } = useParams({ from: Route.fullPath });
	const { data, loading, error } = useQuery(SAVED_ITEM, {
		variables: { query: { id } },
	});

	const savedItem = data?.savedItem;
	const title = savedItem?.title || '';
	const trimmedTitle = title.length > 50 ? title.slice(0, 50).trimEnd() + '...' : title;
	useDocumentTitle(trimmedTitle ? `${trimmedTitle} | Inbox Reader` : 'Inbox Reader');

	const handleGoBack = async () => {
		if (canGoBack) {
			void router.history.back();
		} else {
			void navigate({
				to: '/',
			});
		}
	};

	if (loading) {
		return (
			<Center py="xxl" mt="lg">
				<Stack w={isAboveXsScreen ? '45em' : '100%'} gap="xxl">
					<Skeleton visible height={108} animate />

					<Skeleton visible height={560} animate />
				</Stack>
			</Center>
		);
	}

	// todo: possibly more edge-cases, for example: don't save new position when the article was already fully read?
	// todo: looks like possible perfomance issue... test it more, as it re-render i think on each scroll
	// const [scroll, scrollTo] = useWindowScroll();
	// const [savedScrollPosition, setSavedScrollPosition] = useLocalStorage({
	// 	key: `last-reading-position-${ARTICLE_FROM_BACKEND.id}`,
	// 	defaultValue: 0,
	// });

	// useEffect(() => {
	// 	scrollTo({ y: savedScrollPosition });
	// }, [savedScrollPosition]);
	//
	// useEffect(() => {
	// 	const savePosition = () => setSavedScrollPosition(scroll.y);
	// 	window.addEventListener('beforeunload', savePosition);
	// 	return () => {
	// 		window.removeEventListener('beforeunload', savePosition);
	// 	};
	// }, [scroll.y, setSavedScrollPosition]);

	return (
		<Box py="md" px={isAboveXsScreen ? 24 : 'md'} pb="xxl">
			<Box className={classes.headerContainer}>
				<Group onClick={handleGoBack} align="center" justify="center">
					<Flex hiddenFrom="md">
						<IconArrowLeft />
					</Flex>

					<AppName size="md" variant={isAboveXsScreen ? 'full' : 'short'} />
				</Group>

				{hasSelection ? (
					<ActionIcon
						variant="subtle"
						color="text"
						size="lg"
						onClick={(e) => {
							e.preventDefault();
							highlightSelection();
						}}
						onTouchEnd={(e) => {
							e.preventDefault();
							highlightSelection();
						}}
						hiddenFrom="md"
					>
						{isFullyHighlighted() ? <IconHighlightOff /> : <IconHighlight />}
					</ActionIcon>
				) : (
					<Box hiddenFrom="md">
						<ReaderSettingsOptions direction="row" variant="menu" item={savedItem} />
					</Box>
				)}
			</Box>

			<Box visibleFrom="md" className={classes.readerSettingsContainer}>
				<ReaderSettingsOptions item={savedItem} />
			</Box>

			<Center py="xxl">
				<Box w={isAboveXsScreen ? '45em' : '100%'}>
					<Stack gap="xl">
						{savedItem && (
							<>
								<Stack gap="xxs">
									<Breadcrumbs separator="•" separatorMargin={6}>
										<Text>
											{dayjs(savedItem.createdAt).format('MMMM D, YYYY')}
										</Text>
										<Text>{`${Math.ceil(savedItem?.wordCount / 240).toString()} min read`}</Text>
									</Breadcrumbs>

									<Title order={2}>{savedItem.title}</Title>

									<Group gap={6}>
										{savedItem?.author && (
											<Text>
												{`By ${savedItem.author}`}
												{savedItem.sourceDomain ? ',' : ''}
											</Text>
										)}
										{savedItem?.sourceDomain && (
											<Text>{savedItem.sourceDomain}</Text>
										)}
										{savedItem?.originalUrl && (
											<>
												<Text>•</Text>
												<Anchor
													href={savedItem.originalUrl}
													target="_blank"
												>
													See original
												</Anchor>
											</>
										)}
									</Group>

									<Group gap={6}>
										{savedItem?.labels.map((label) => (
											<Badge size="sm" radius="sm" color={label.color}>
												{label.name}
											</Badge>
										))}
									</Group>
								</Stack>
								<Divider />
							</>
						)}

						{!error && savedItem ? (
							<TypographyStylesProvider
								style={{
									wordBreak: 'break-word',
								}}
								className={classes.readerContent}
							>
								<HighlightableArticle content={savedItem?.article?.contentHtml} />
							</TypographyStylesProvider>
						) : (
							<Text ta="center">
								Something went wrong, and the article content couldn't be loaded.
								Please try again or contact support.
							</Text>
						)}
					</Stack>
				</Box>
			</Center>
		</Box>
	);
};
