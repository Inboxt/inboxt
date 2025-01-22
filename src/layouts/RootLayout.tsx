import { Box, Center, Flex } from '@mantine/core';
import { Outlet, useMatchRoute } from '@tanstack/react-router';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useDisclosure } from '@mantine/hooks';

import classes from './RootLayout.module.css';
import { useReaderContext } from '../context/ReaderContext.tsx';
import { useLargeScreen } from '../hooks/useLargeScreen.tsx';

export const RootLayout = () => {
	const isLargeScreen = useLargeScreen();
	const [opened, { toggle }] = useDisclosure(isLargeScreen);
	const { isSelected } = useReaderContext();
	const matchRoute = useMatchRoute();

	const matchedLoginRoute = matchRoute({ to: '/login' }) as boolean;
	if (matchedLoginRoute) {
		return <Outlet />;
	}

	return (
		<Center>
			<Flex className={classes.container}>
				<Navbar opened={opened} toggle={toggle} />

				<Box
					className={classes.content}
					pt={isSelected && !isLargeScreen ? 0 : 'md'}
				>
					<Header opened={opened} toggle={toggle} />

					<Outlet />
				</Box>

				<Footer visibleFrom="lg" />
			</Flex>
		</Center>
	);
};
