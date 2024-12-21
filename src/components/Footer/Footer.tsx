import { Anchor, Box, Breadcrumbs, Text, BoxProps } from '@mantine/core';

import classes from './Footer.module.css';
import { AppName } from '../AppName';

export const Footer = (props: BoxProps) => {
	return (
		<Box w={310} pt="md" pl="xl" {...props}>
			<AppName />

			<Text fz="sm" lh="xs">
				Something something here. Looks weird without any text. Nothing
				too fancy.
			</Text>

			<Breadcrumbs
				separator="•"
				separatorMargin={6}
				classNames={{
					separator: classes.separator,
				}}
				mt="lg"
			>
				<Anchor fz="sm">Send Feedback</Anchor>
				<Anchor fz="sm">Privacy</Anchor>
				<Anchor fz="sm">Terms</Anchor>
				<Anchor fz="sm">Help</Anchor>
			</Breadcrumbs>
		</Box>
	);
};
