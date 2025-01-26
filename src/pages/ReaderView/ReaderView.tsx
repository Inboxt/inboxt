import {
	Anchor,
	Box,
	Center,
	Divider,
	Group,
	Stack,
	Text,
	Title,
	TypographyStylesProvider,
} from '@mantine/core';
import { AppName } from '../../components/AppName';

import classes from './ReaderView.module.css';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { ReaderSettingsOptions } from '../../components/ReaderSettingsOptions';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '../../routes/$id.tsx';
import { AppViews } from '../../constants';

import { ARTICLE_FROM_BACKEND } from '../../constants/fake-backend.ts';

// todo: from backend :)

export const ReaderView = () => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const navigate = useNavigate({ from: Route.fullPath });

	return (
		<Box py="md" px={isAboveXsScreen ? 24 : 'md'} pb="xxl">
			<Box className={classes.headerContainer}>
				<Box
					onClick={() =>
						void navigate({
							to: '/',
							search: { view: AppViews.INBOX },
						})
					}
				>
					<AppName
						size="md"
						variant={isAboveXsScreen ? 'full' : 'short'}
					/>
				</Box>

				<Box hiddenFrom="md">
					<ReaderSettingsOptions direction="row" variant="menu" />
				</Box>
			</Box>

			<Box visibleFrom="md" className={classes.readerSettingsContainer}>
				<ReaderSettingsOptions />
			</Box>

			<Center py="md">
				<Box w={isAboveXsScreen ? '45em' : '100%'}>
					<Stack gap="xl">
						<Stack gap="xxs">
							<Group gap={6}>
								<Text>August 30, 2024</Text>
								<Text>•</Text>
								<Text>7 min read</Text>
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
						</Stack>

						<Divider />

						<TypographyStylesProvider
							style={{
								wordBreak: 'break-word',
							}}
						>
							<div
								dangerouslySetInnerHTML={{
									__html: ARTICLE_FROM_BACKEND.content,
								}}
							/>
						</TypographyStylesProvider>
					</Stack>
				</Box>
			</Center>
		</Box>
	);
};
