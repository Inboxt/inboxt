import { Anchor, Breadcrumbs } from '@mantine/core';
import { modals } from '@modals/modals.ts';

import classes from './FooterLinks.module.css';

type FooterLinksProps = {
	justify?: 'flex-start' | 'center';
};

export const FooterLinks = ({ justify = 'flex-start' }: FooterLinksProps) => {
	return (
		<Breadcrumbs
			separator="•"
			separatorMargin={6}
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
			<Anchor fz="sm" onClick={modals.openPlanModal}>
				Pricing
			</Anchor>
		</Breadcrumbs>
	);
};
