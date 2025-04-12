import {
	ActionIcon,
	Anchor,
	Badge,
	Box,
	Center,
	Divider,
	Flex,
	Group,
	Stack,
	Text,
	Title,
	TypographyStylesProvider,
} from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import {
	IconArrowLeft,
	IconHighlight,
	IconHighlightOff,
} from '@tabler/icons-react';

import classes from './ReaderView.module.css';
import { AppName } from '../../components/AppName';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { ReaderSettingsOptions } from '../../components/ReaderSettingsOptions';
import { Route } from '../../routes/r.$id.tsx';
import { AppViews } from '../../constants';

import {
	ARTICLE_FROM_BACKEND,
	BACKEND_LABELS,
} from '../../constants/fake-backend';
import { useTextHighlighting } from '../../hooks/useTextSelection.tsx';
import { HighlightableArticle } from '../../components/HighlightableArticle';

// todo: from backend :)

export const ReaderView = () => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const navigate = useNavigate({ from: Route.fullPath });

	const { selectedText, highlightSelection, isFullyHighlighted } =
		useTextHighlighting();
	const hasSelection = Boolean(selectedText);

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
				<Group
					onClick={() =>
						void navigate({
							to: '/',
							search: { view: AppViews.INBOX },
						})
					}
					align="center"
					justify="center"
				>
					<Flex hiddenFrom="md">
						<IconArrowLeft />
					</Flex>

					<AppName
						size="md"
						variant={isAboveXsScreen ? 'full' : 'short'}
					/>
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
						{isFullyHighlighted() ? (
							<IconHighlightOff />
						) : (
							<IconHighlight />
						)}
					</ActionIcon>
				) : (
					<Box hiddenFrom="md">
						<ReaderSettingsOptions direction="row" variant="menu" />
					</Box>
				)}
			</Box>

			<Box visibleFrom="md" className={classes.readerSettingsContainer}>
				<ReaderSettingsOptions />
			</Box>

			<Center py="xxl">
				<Box w={isAboveXsScreen ? '45em' : '100%'}>
					<Stack gap="xl">
						<Stack gap="xxs">
							<Group gap={6}>
								<Text>August 30, 2024</Text>
								<Text>•</Text>
								<Text>{`${Math.ceil(ARTICLE_FROM_BACKEND.word_count / 240).toString()} min read`}</Text>
							</Group>

							<Title order={2}>
								{ARTICLE_FROM_BACKEND.title}
							</Title>

							<Group gap={6}>
								<Text>{`By ${ARTICLE_FROM_BACKEND.author},`}</Text>
								<Text>{ARTICLE_FROM_BACKEND.domain}</Text>
								<Text>•</Text>
								<Anchor href={ARTICLE_FROM_BACKEND.url}>
									See original
								</Anchor>
							</Group>

							<Group gap={6}>
								{BACKEND_LABELS.map((label) => (
									<Badge
										size="sm"
										radius="sm"
										color={label.color}
									>
										{label.name}
									</Badge>
								))}
							</Group>
						</Stack>

						<Divider />

						<TypographyStylesProvider
							style={{
								wordBreak: 'break-word',
							}}
						>
							<HighlightableArticle
								content={ARTICLE_FROM_BACKEND.content}
							/>
						</TypographyStylesProvider>
					</Stack>
				</Box>
			</Center>
		</Box>
	);
};
