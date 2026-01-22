import { BoxProps, Divider, Stack } from '@mantine/core';

import { AppName } from '~components/AppName';
import { AppNotifications } from '~components/AppNotifications';

import { FooterLinks } from '../FooterLinks';

export const Footer = (props: BoxProps) => {
	return (
		<Stack w={310} pt="md" pl="xl" gap={0} h="100%" mih={0} {...props}>
			<AppName />

			<AppNotifications />

			<Divider size="xs" color="gray.2" mb="sm" />

			<FooterLinks />
		</Stack>
	);
};
