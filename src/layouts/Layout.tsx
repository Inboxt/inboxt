import { Box, Center, Flex } from '@mantine/core';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useDisclosure } from '@mantine/hooks';
import { MobileHeader } from '../components/MobileHeader';

import classes from './Layout.module.css';
import { useReaderContext } from '../context/ReaderContext.tsx';
import { SelectionHeader } from '../components/SelectionHeader';
import { useLargeScreen } from '../hooks/useLargeScreen.tsx';
import { TestHeader } from '../components/TestHeader';
import { AppName } from '../components/AppName';

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
					pt={isSelected && !isLargeScreen ? 0 : 16}
				>
					{/*{!isSelected && !isLargeScreen && (*/}
					{/*	<MobileHeader opened={opened} toggle={toggle} />*/}
					{/*)}*/}

					{/*{(isLargeScreen || !isSelected) && <Header />}*/}

					{/*{isSelected && !isLargeScreen && <SelectionHeader />}*/}

					<TestHeader opened={opened} toggle={toggle} />

					{children}
				</Box>

				<Footer visibleFrom="lg" />
			</Flex>
		</Center>
	);
};
