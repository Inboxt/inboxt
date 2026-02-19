import { BoxProps, Stack } from '@mantine/core';

import { AppName } from '~components/AppName';

import { FooterLinks } from '../FooterLinks';

export const Footer = (props: BoxProps) => {
	return (
		<Stack w={310} pt="md" pl="xl" gap="md" h="100%" mih={0} {...props}>
			<AppName />

			<FooterLinks />
		</Stack>
	);
};
