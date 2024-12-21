import { useDisclosure } from '@mantine/hooks';

export const useNavbar = () => {
	const [openedNavbar, { toggle: toggleNavbar }] = useDisclosure(true);
	const [openedDrawer, { toggle: toggleDrawer }] = useDisclosure(false);

	const toggle = () => {
		toggleDrawer();
		toggleNavbar();
	};

	return {
		openedNavbar,
		openedDrawer,
		toggle,
	};
};
