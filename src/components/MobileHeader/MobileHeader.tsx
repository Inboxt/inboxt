import { Box, Burger, Group } from '@mantine/core';
import { UserMenu } from '../UserMenu';
import { AppName } from '../AppName';

type MobileHeaderProps = {
	opened: boolean;
	toggle: () => void;
};

export const MobileHeader = ({ opened, toggle }: MobileHeaderProps) => {
	return (
		<Box px="md" pb="xs">
			<Group gap={0} justify="space-between">
				<Burger opened={opened} onClick={toggle} />

				<AppName />
				<UserMenu />
			</Group>
		</Box>
	);
};
