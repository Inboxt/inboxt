import { Anchor, Breadcrumbs } from '@mantine/core';

import classes from './FooterLinks.module.css';

type FooterLinksProps = {
	justify?: 'flex-start' | 'center';
};

export const FooterLinks = ({ justify = 'flex-start' }: FooterLinksProps) => {
	return (
		<Breadcrumbs
			separator="•"
			classNames={{
				separator: classes.separator,
			}}
			style={{
				justifyContent: justify,
			}}
		>
			<Anchor fz="sm">Hep</Anchor>
			<Anchor fz="sm">Privacy</Anchor>
			<Anchor fz="sm">Terms</Anchor>
			<Anchor fz="sm">Roadmap</Anchor>
		</Breadcrumbs>
	);
};
