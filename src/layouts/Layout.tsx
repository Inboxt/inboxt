import { Box, Center, Flex } from '@mantine/core';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useDisclosure } from '@mantine/hooks';

import classes from './Layout.module.css';
import { useReaderContext } from '../context/ReaderContext.tsx';
import { useLargeScreen } from '../hooks/useLargeScreen.tsx';

type LayoutProps = {
	children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
	const isLargeScreen = useLargeScreen();
	const [opened, { toggle }] = useDisclosure(isLargeScreen);

	const { isSelected } = useReaderContext();

	return (
		<Center>
			<Flex mih="100vh">
				<Navbar opened={opened} toggle={toggle} />

				<Box
					className={classes.content}
					pt={isSelected && !isLargeScreen ? 0 : 'md'}
				>
					<Header opened={opened} toggle={toggle} />

					{children}
				</Box>

				<Footer visibleFrom="lg" />
			</Flex>
		</Center>
	);
};
