import { Box, Center, Flex, Alert, Text, Button } from '@mantine/core';
import { ReactNode } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@modals/modals.ts';
import { useRouteContext } from '@tanstack/react-router';

import classes from './AppLayout.module.css';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

import { useReaderContext } from '../context/ReaderContext.tsx';
import { useScreenQuery } from '../hooks/useScreenQuery.tsx';
import { Route } from '../routes/_auth.tsx';

type AppLayoutProps = {
	children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
	const routeData = useRouteContext({ from: Route.id });
	const isAboveLgScreen = useScreenQuery('lg', 'above');
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const [opened, { toggle }] = useDisclosure(isAboveLgScreen);
	const { isSelected } = useReaderContext();

	return (
		<>
			{!routeData?.user?.isEmailVerified && !!routeData?.user?.id && (
				<Alert radius={0} p="xxs">
					<Flex justify="center" gap="sm" wrap="wrap">
						<Text ta="center">
							{isAboveMdScreen
								? "We've sent a confirmation email to your address. Please verify your email to unlock full access to all features."
								: 'Verify your email to unlock full access'}
						</Text>
						<Button
							variant="light"
							size="compact-sm"
							onClick={modals.openVerifyEmailModal}
						>
							Verify Now
						</Button>
					</Flex>
				</Alert>
			)}

			<Center className={classes.layout}>
				<Flex className={classes.container}>
					<Navbar opened={opened} toggle={toggle} />

					<Box
						className={classes.content}
						pt={isSelected && !isAboveLgScreen ? 0 : 'md'}
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
