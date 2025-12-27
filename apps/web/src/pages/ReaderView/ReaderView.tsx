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
	Typography,
} from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { IconArrowLeft, IconHighlight } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useParams, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import { READER_THEMES } from '@inboxt/common';
import { theme } from '@inboxt/ui';

import { AppName } from '~components/AppName';
import { HighlightableArticle } from '~components/HighlightableArticle';
import { NewsletterSubscriptionButton } from '~components/NewsletterSubscriptionButton';
import { ReaderSettingsOptions } from '~components/ReaderSettingsOptions';
import { useReaderSettings, makeReaderResolver } from '~hooks/useReaderSettings.tsx';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { useTextHighlighting } from '~hooks/useTextSelection';
import { SAVED_ITEM, SavedItemType } from '~lib/graphql';
import { Route } from '~routes/r.$id';

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

	const content =
		savedItem?.type === SavedItemType.Article
			? savedItem.article?.contentHtml
			: savedItem?.type === SavedItemType.Newsletter
				? savedItem.newsletter?.contentHtml
				: undefined;

	return (
		<Box
			pt="md"
			px={isAboveXsScreen ? 'xl' : 'md'}
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
								<Typography className={classes.typography}>
									<HighlightableArticle
										content={content || null}
										data={savedItem}
									/>
								</Typography>
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
