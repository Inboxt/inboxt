import { useMutation, useQuery } from '@apollo/client';
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
	MantineProvider,
	Skeleton,
	Stack,
	Text,
	Title,
	Typography,
} from '@mantine/core';
import { useDebouncedCallback, useDocumentTitle } from '@mantine/hooks';
import { IconArrowLeft, IconHighlight } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useParams, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect, useRef, useState, UIEvent } from 'react';

import { APP_PRIMARY_COLOR, READER_THEMES } from '@inboxt/common';
import { theme } from '@inboxt/ui';

import { AppName } from '~components/AppName';
import { HighlightableArticle } from '~components/HighlightableArticle';
import { ItemsOptions } from '~components/ItemsOptions';
import { NewsletterSubscriptionButton } from '~components/NewsletterSubscriptionButton';
import { ReaderSettingsOptions } from '~components/ReaderSettingsOptions';
import { ReadingProgressBar } from '~components/ReadingProgressBar';
import { useAdjacentItems } from '~hooks/useAdjacentItems';
import { useReaderSettings, makeReaderResolver } from '~hooks/useReaderSettings.tsx';
import { useReaderSwipeNavigation } from '~hooks/useReaderSwipeNavigation';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';
import { SAVED_ITEM, SavedItemType, UPDATE_READING_PROGRESS, SavedItem } from '~lib/graphql';
import { Route } from '~routes/_auth._main.r.$id';

import classes from './ReaderView.module.css';

export const ReaderView = () => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const navigate = useNavigate();
	const { effectiveTheme, contentSettings } = useReaderSettings();

	const { id } = useParams({ from: Route.id });
	const { data, loading, error } = useQuery(SAVED_ITEM, {
		variables: { query: { id } },
		fetchPolicy: 'cache-and-network',
	});
	const [updateReadingProgress] = useMutation(UPDATE_READING_PROGRESS);
	const { nextId, prevId } = useAdjacentItems(id);

	const [lastResumedId, setLastResumedId] = useState<string | null>(null);
	const [currentProgress, setCurrentProgress] = useState(0);
	const [toolbarVisible, setToolbarVisible] = useState(false);
	const [headerVisible, setHeaderVisible] = useState(true);
	const [isActionsLoading, setIsActionsLoading] = useState(false);
	const hideHeaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const showToolbarDebounced = useDebouncedCallback(() => {
		const container = readerRef.current;
		if (container) {
			const { scrollTop, scrollHeight, clientHeight } = container;
			const isAtTop = scrollTop < 100;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;

			if (!isAtTop || isAtBottom) {
				setToolbarVisible(true);
			}
		}
	}, 500);

	const isRestoringScroll =
		!!data?.savedItem && lastResumedId !== id && (data.savedItem.readingProgress || 0) > 0;

	const debouncedUpdateProgress = useDebouncedCallback((progress: number) => {
		void updateReadingProgress({
			variables: {
				data: {
					id,
					progress,
				},
			},
		});
	}, 1000);

	const handleScroll = (e: UIEvent<HTMLDivElement>) => {
		const container = e.currentTarget;
		const { scrollTop, scrollHeight, clientHeight } = container;
		const maxScroll = scrollHeight - clientHeight;

		if (maxScroll <= 0) {
			return;
		}

		const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
		setCurrentProgress(progress);
		debouncedUpdateProgress(progress);

		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
		const isAtTop = scrollTop < 50;

		if (isAtBottom) {
			setToolbarVisible(true);
		} else {
			setToolbarVisible(false);
		}

		// Header Focus Mode: Always show while scrolling, hide after delay when stopped
		setHeaderVisible(true);
		if (hideHeaderTimeoutRef.current) {
			clearTimeout(hideHeaderTimeoutRef.current);
		}

		if (!isAtTop && !isAtBottom) {
			hideHeaderTimeoutRef.current = setTimeout(() => {
				setHeaderVisible(false);
			}, 2500);
		}

		showToolbarDebounced();
	};

	const { handleTouchStart, handleTouchMove, handleTouchEnd } = useReaderSwipeNavigation({
		nextId,
		prevId,
		disabled: isActionsLoading,
		onNavigateToNext: () => {
			if (!nextId) {
				return;
			}

			void navigate({
				to: '/r/$id',
				params: { id: nextId },
				search: (prev) => prev,
				replace: true,
			});
		},
		onNavigateToPrev: () => {
			if (!prevId) {
				return;
			}

			void navigate({
				to: '/r/$id',
				params: { id: prevId },
				search: (prev) => prev,
				replace: true,
			});
		},
	});

	const readerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const savedItem = data?.savedItem;
		if (savedItem && readerRef.current && lastResumedId !== id) {
			const progress = savedItem.readingProgress || 0;
			const container = readerRef.current;

			if (progress === 0 && loading) {
				return;
			}

			if (progress === 0) {
				setLastResumedId(id);
				setCurrentProgress(0);
				return;
			}

			// Immediately set the progress bar to the correct value
			setCurrentProgress(progress);

			// We need to wait a bit for the content to be rendered to get accurate scrollHeight
			// But since we are using useEffect with data as dependency, it should be mostly fine.
			// However, images might still be loading.
			setTimeout(() => {
				const { scrollHeight, clientHeight } = container;
				container.scrollTop = progress * (scrollHeight - clientHeight);
				setLastResumedId(id);
			}, 100);
		}
	}, [data?.savedItem, id, lastResumedId, loading]);

	useEffect(() => {
		if (readerRef.current && lastResumedId !== id) {
			readerRef.current.scrollTo(0, 0);
		}
	}, [id, lastResumedId]);

	useEffect(() => {
		return () => {
			if (hideHeaderTimeoutRef.current) {
				clearTimeout(hideHeaderTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const html = document.documentElement;
		const previous = html.getAttribute('data-mantine-color-scheme');

		return () => {
			if (previous) {
				html.setAttribute('data-mantine-color-scheme', previous);
			} else {
				html.removeAttribute('data-mantine-color-scheme');
			}
		};
	}, []);

	useEffect(() => {
		const container = readerRef.current;
		if (container && data?.savedItem && !loading) {
			const { scrollHeight, clientHeight, scrollTop } = container;
			const maxScroll = scrollHeight - clientHeight;
			if (maxScroll <= 0) {
				setTimeout(() => {
					setToolbarVisible(true);
					setHeaderVisible(true);
				}, 0);
			} else if (scrollTop >= 100) {
				setTimeout(() => {
					setToolbarVisible(true);
					setHeaderVisible(true);
				}, 0);
			} else {
				setTimeout(() => {
					setToolbarVisible(false);
					setHeaderVisible(true);
				}, 0);
			}
		}
	}, [data?.savedItem, loading, id]);

	const savedItem = data?.savedItem;
	const title = savedItem?.title || '';
	const trimmedTitle = title.length > 50 ? title.slice(0, 50).trimEnd() + '...' : title;
	useDocumentTitle(trimmedTitle ? `${trimmedTitle} | Inboxt` : 'Inboxt');

	const { selectedText, highlightSelection, rangeRect, hasValidSelection } = useTextHighlighting(
		undefined,
		savedItem?.id,
	);

	const handleGoBack = () => {
		if (canGoBack) {
			router.history.back();
		} else {
			void navigate({
				to: '/',
			});
		}
	};

	const handleActionComplete = async () => {
		if (nextId) {
			await navigate({
				to: '/r/$id',
				params: { id: nextId },
				search: (prev) => prev,
				replace: true,
			});
		} else {
			handleGoBack();
		}
	};

	const content =
		savedItem?.type === SavedItemType.Article
			? savedItem.article?.contentHtml
			: savedItem?.type === SavedItemType.Newsletter
				? savedItem.newsletter?.contentHtml
				: undefined;

	const loadingSkeleton = (
		<Center py="xxl" mt="lg">
			<Stack w={isAboveXsScreen ? '45em' : '100%'} gap="xxl">
				<Skeleton visible height={120} animate />
				<Skeleton visible height={560} animate />
			</Stack>
		</Center>
	);

	return (
		<Box
			ref={readerRef}
			pt={isAboveMdScreen ? 'md' : 0}
			px={isAboveXsScreen ? 'xl' : 'md'}
			className={classes.readerView}
			data-reader-theme={effectiveTheme}
			id="reader-root"
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onScroll={handleScroll}
		>
			<MantineProvider
				forceColorScheme={effectiveTheme === 'dark' ? 'dark' : 'light'}
				cssVariablesResolver={makeReaderResolver(
					READER_THEMES[effectiveTheme],
					contentSettings,
				)}
				theme={theme}
				cssVariablesSelector="#reader-root"
			>
				{loading ? (
					loadingSkeleton
				) : (
					<>
						<Box
							className={clsx(
								classes.headerContainer,
								!headerVisible && classes.headerHidden,
							)}
						>
							<Group onClick={handleGoBack} align="center" justify="center">
								<Flex hiddenFrom="md">
									<IconArrowLeft />
								</Flex>
								<AppName size="md" variant={isAboveXsScreen ? 'full' : 'short'} />
							</Group>

							{selectedText && rangeRect && hasValidSelection ? (
								<ActionIcon
									variant="subtle"
									color="text"
									size="lg"
									onClick={(e) => {
										e.preventDefault();
										void highlightSelection();
									}}
									onTouchEnd={(e) => {
										e.preventDefault();
										void highlightSelection();
									}}
									hiddenFrom="md"
								>
									<IconHighlight />
								</ActionIcon>
							) : (
								<Box hiddenFrom="md">
									<ReaderSettingsOptions
										direction="row"
										variant="menu"
										item={(savedItem as SavedItem) || null}
										loading={isActionsLoading}
										onLoadingChange={setIsActionsLoading}
									/>
								</Box>
							)}

							{!isAboveMdScreen && (
								<ReadingProgressBar
									progress={currentProgress}
									className={classes.headerProgressBar}
								/>
							)}
						</Box>

						<Box visibleFrom="md" className={classes.readerSettingsContainer}>
							<ReaderSettingsOptions
								item={(data?.savedItem as SavedItem) || null}
								loading={isActionsLoading}
								onLoadingChange={setIsActionsLoading}
							/>
						</Box>

						<Box style={{ position: 'relative', flex: 1 }}>
							{isRestoringScroll && (
								<Box
									style={{
										position: 'absolute',
										inset: 0,
										zIndex: 10,
										background: 'var(--mantine-color-body)',
									}}
								>
									{loadingSkeleton}
								</Box>
							)}

							<Box
								style={{
									visibility: isRestoringScroll ? 'hidden' : 'visible',
									opacity: isRestoringScroll ? 0 : 1,
									transition: 'opacity 0.2s ease-in-out',
								}}
							>
								<Center pt="xxl">
									<Box className={classes.readerContent}>
										<Stack gap="xl">
											{savedItem && (
												<>
													<Stack gap="xxs">
														<Breadcrumbs separator="•">
															<Text>
																{dayjs(savedItem.createdAt).format(
																	'MMMM D, YYYY HH:mm',
																)}
															</Text>
															<Text>{`${Math.ceil((savedItem.wordCount || 0) / 240)} min read`}</Text>
														</Breadcrumbs>

														<Title order={2}>{savedItem.title}</Title>

														<Group gap={6}>
															{savedItem.author && (
																<Text>
																	{`By ${savedItem.author}`}
																	{savedItem.sourceDomain
																		? ','
																		: ''}
																</Text>
															)}
															{savedItem.sourceDomain && (
																<Text>
																	{savedItem.sourceDomain}
																</Text>
															)}
															{savedItem.originalUrl && (
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

															{savedItem.newsletter?.subscription && (
																<NewsletterSubscriptionButton
																	subscription={
																		savedItem.newsletter
																			.subscription
																	}
																/>
															)}
														</Group>

														<Group gap={6}>
															{(savedItem.labels || []).map(
																(label) => (
																	<Badge
																		size="sm"
																		radius="sm"
																		color={label.color}
																		autoContrast={
																			label.color !==
																			APP_PRIMARY_COLOR
																		}
																	>
																		{label.name}
																	</Badge>
																),
															)}
														</Group>
													</Stack>
													<Divider color="var(--reader-border-color)" />
												</>
											)}

											{!error && savedItem && !content && (
												<Text ta="center">
													{savedItem.description ?? ''}
												</Text>
											)}

											{!error && savedItem && content && (
												<Typography className={classes.typography}>
													<HighlightableArticle
														content={content || null}
														data={savedItem as SavedItem}
													/>
												</Typography>
											)}

											{(error || !savedItem) && (
												<Text ta="center">
													Something went wrong, and the article content
													couldn't be loaded. Please try again or contact
													support.
												</Text>
											)}
										</Stack>
									</Box>
								</Center>
							</Box>
						</Box>

						{savedItem && (
							<Box
								className={clsx(
									classes.bottomToolbar,
									(!toolbarVisible || !headerVisible) &&
										classes.bottomToolbarHidden,
								)}
								hiddenFrom="md"
							>
								<ItemsOptions
									items={[savedItem as SavedItem]}
									mode="reader-toolbar"
									onActionComplete={handleActionComplete}
									onLoadingChange={setIsActionsLoading}
								/>
							</Box>
						)}
					</>
				)}
			</MantineProvider>
		</Box>
	);
};
