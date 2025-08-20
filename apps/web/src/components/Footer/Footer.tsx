import { BoxProps, Divider, Stack } from '@mantine/core';

import { AppNotifications } from '~components/AppNotifications';

import { AppName } from '../AppName';
import { FooterLinks } from '../FooterLinks';

export const Footer = (props: BoxProps) => {
	return (
		<Stack w={310} pt="md" pl="xl" gap={0} h="100%" mih={0} {...props}>
			<AppName />

			<AppNotifications />

			<Divider size="xs" color="gray.2" my="sm" />

			<FooterLinks />
		</Stack>
	);
};
