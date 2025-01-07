import { Box, Text, BoxProps } from '@mantine/core';

import { AppName } from '../AppName';
import { FooterLinks } from '../FooterLinks';

export const Footer = (props: BoxProps) => {
	return (
		<Box w={310} pt="md" pl="xl" {...props}>
			<AppName />

			<Text fz="sm" lh="xs" mb="lg">
				Something something here. Looks weird without any text. Nothing
				too fancy.
			</Text>

			<FooterLinks />
		</Box>
	);
};
