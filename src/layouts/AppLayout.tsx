import { Box, Center, Flex } from '@mantine/core';
import { ReactNode } from 'react';
import { useDisclosure } from '@mantine/hooks';

import classes from './AppLayout.module.css';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

import { useReaderContext } from '../context/ReaderContext.tsx';
import { useScreenQuery } from '../hooks/useScreenQuery.tsx';

type AppLayoutProps = {
	children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
	const isAboveLgScreen = useScreenQuery('lg', 'above');
	const [opened, { toggle }] = useDisclosure(isAboveLgScreen);
	const { isSelected } = useReaderContext();

	return (
		<Center>
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
	);
};
