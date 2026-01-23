import { Anchor, Breadcrumbs, Flex, Text } from '@mantine/core';

import classes from './FooterLinks.module.css';

type FooterLinksProps = {
	separator?: string;
	justify?: 'flex-start' | 'center';
};

export const FooterLinks = ({ separator = '•', justify = 'flex-start' }: FooterLinksProps) => {
	return (
		<Flex direction="column" wrap="wrap" gap="xs" align="center">
			<Breadcrumbs
				separator={separator}
				classNames={{
					separator: classes.separator,
				}}
				style={{
					justifyContent: justify,
				}}
			>
				<Anchor fz="sm" href="mailto:support@inboxt.app">
					Help
				</Anchor>
				<Anchor fz="sm" href="https://docs.inboxt.app">
					Docs
				</Anchor>
				<Anchor fz="sm">Privacy</Anchor>
				<Anchor fz="sm">Terms</Anchor>
				<Anchor fz="sm" href="https://inboxt.app/roadmap">
					Roadmap
				</Anchor>
			</Breadcrumbs>

			<Text size="xs" c="dimmed">
				<Anchor
					href="https://github.com/inboxt/inboxt"
					target="_blank"
					rel="noopener noreferrer"
					size="xs"
					c="dimmed"
				>
					Open Source
				</Anchor>
				{' · Licensed under AGPL-3.0'}
			</Text>
		</Flex>
	);
};
