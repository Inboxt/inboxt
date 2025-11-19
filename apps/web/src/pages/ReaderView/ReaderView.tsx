import { useQuery } from '@apollo/client';
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
	TypographyStylesProvider,
} from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { IconArrowLeft, IconHighlight } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useParams, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import { READER_THEMES } from '@inboxt/common';

import { AppName } from '~components/AppName';
import { HighlightableArticle } from '~components/HighlightableArticle';
import { NewsletterSubscriptionButton } from '~components/NewsletterSubscriptionButton';
import { ReaderSettingsOptions } from '~components/ReaderSettingsOptions';
import { useReaderSettings, makeReaderResolver } from '~hooks/useReaderSettings.tsx';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';
import { SAVED_ITEM } from '~lib/graphql';
import { SavedItemType } from '~lib/graphql/generated/graphql.ts';
import { Route } from '~routes/r.$id';

import { theme } from '../../theme';

import classes from './ReaderView.module.css';

export const ReaderView = () => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const navigate = useNavigate({ from: Route.fullPath });
	const { effectiveTheme, contentSettings } = useReaderSettings();

	const { id } = useParams({ from: Route.fullPath });
	const { data, loading, error } = useQuery(SAVED_ITEM, {
		variables: { query: { id } },
		fetchPolicy: 'cache-and-network',
	});

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

	if (loading) {
		return (
			<Center py="xxl" mt="lg">
				<Stack w={isAboveXsScreen ? '45em' : '100%'} gap="xxl">
					<Skeleton visible height={120} animate />

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

	const content =
		savedItem?.type === SavedItemType.Article
			? savedItem.article?.contentHtml
			: savedItem?.type === SavedItemType.Newsletter
				? savedItem.newsletter?.contentHtml
				: undefined;

	return (
		<Box
			pt="md"
			px={isAboveXsScreen ? 24 : 'md'}
			className={classes.readerView}
			data-reader-theme={effectiveTheme}
			id="reader-root"
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
				<Box className={classes.headerContainer}>
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
								highlightSelection();
							}}
							onTouchEnd={(e) => {
								e.preventDefault();
								highlightSelection();
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
								item={savedItem || null}
							/>
						</Box>
					)}
				</Box>

				<Box visibleFrom="md" className={classes.readerSettingsContainer}>
					<ReaderSettingsOptions item={data?.savedItem || null} />
				</Box>

				<Center pt="xxl">
					<Box className={classes.readerContent}>
						<Stack gap="xl">
							{savedItem && (
								<>
									<Stack gap="xxs">
										<Breadcrumbs separator="•" separatorMargin={6}>
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
													{savedItem.sourceDomain ? ',' : ''}
												</Text>
											)}
											{savedItem.sourceDomain && (
												<Text>{savedItem.sourceDomain}</Text>
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
													subscription={savedItem.newsletter.subscription}
												/>
											)}
										</Group>

										<Group gap={6}>
											{(savedItem.labels || []).map((label) => (
												<Badge size="sm" radius="sm" color={label.color}>
													{label.name}
												</Badge>
											))}
										</Group>
									</Stack>
									<Divider color="var(--reader-border-color)" />
								</>
							)}

							{!error && savedItem && !content && (
								<Text ta="center">{savedItem.description ?? ''}</Text>
							)}

							{!error && savedItem && content && (
								<TypographyStylesProvider className={classes.typography}>
									<HighlightableArticle
										content={content || null}
										data={savedItem}
									/>
								</TypographyStylesProvider>
							)}

							{(error || !savedItem) && (
								<Text ta="center">
									Something went wrong, and the article content couldn't be
									loaded. Please try again or contact support.
								</Text>
							)}
						</Stack>
					</Box>
				</Center>
			</MantineProvider>
		</Box>
	);
};
