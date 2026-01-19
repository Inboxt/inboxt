import { Anchor, Breadcrumbs } from '@mantine/core';

import classes from './FooterLinks.module.css';

type FooterLinksProps = {
	separator?: string;
	justify?: 'flex-start' | 'center';
};

export const FooterLinks = ({ separator = '•', justify = 'flex-start' }: FooterLinksProps) => {
	return (
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
	);
};
