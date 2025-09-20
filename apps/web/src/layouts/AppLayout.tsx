import { Box, Center, Flex } from '@mantine/core';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { useRouteContext } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { Footer } from '~components/Footer';
import { Header } from '~components/Header';
import { Navbar } from '~components/Navbar';
import { UnverifiedEmailAlert } from '~components/UnverifiedEmailAlert';
import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery';

import { Route } from '../routes/_auth';

import classes from './AppLayout.module.css';

type AppLayoutProps = {
	children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
	const routeData = useRouteContext({ from: Route.id });
	const isAboveLgScreen = useScreenQuery('lg', 'above');
	const [opened, { toggle }] = useDisclosure(isAboveLgScreen);
	const { selectedItems } = useContentSelection();
	useDocumentTitle('Inbox Reader');

	return (
		<>
			<UnverifiedEmailAlert user={routeData.user} />

			<Center className={classes.layout}>
				<Flex className={classes.container}>
					<Navbar opened={opened} toggle={toggle} />

					<Box
						className={classes.content}
						pt={selectedItems.length && !isAboveLgScreen ? 0 : 'md'}
					>
						<Header opened={opened} toggle={toggle} />

						{children}
					</Box>

					<Footer visibleFrom="lg" />
				</Flex>
			</Center>
		</>
	);
};
