import { Anchor, Breadcrumbs, Flex, Text } from '@mantine/core';

import classes from './FooterLinks.module.css';

type FooterLinksProps = {
	separator?: string;
	position?: 'left' | 'center';
};

export const FooterLinks = ({ separator = '•', position = 'left' }: FooterLinksProps) => {
	return (
		<Flex direction="column" wrap="wrap" gap="xs">
			<Breadcrumbs
				separator={separator}
				classNames={{
					separator: classes.separator,
				}}
				style={{
					justifyContent: position === 'left' ? 'flex-start' : 'center',
				}}
			>
				<Anchor fz="sm" href="https://github.com/Inboxt/inboxt/issues">
					Help
				</Anchor>
				<Anchor fz="sm" href="https://docs.inboxt.app">
					Docs
				</Anchor>
				<Anchor fz="sm" href="https://inboxt.app/roadmap">
					Roadmap
				</Anchor>
			</Breadcrumbs>

			<Text size="xs" c="dimmed" ta={position}>
				<Anchor
					href="https://github.com/Inboxt/inboxt"
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
