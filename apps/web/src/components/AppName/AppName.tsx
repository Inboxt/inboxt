import { Group, Image, Title, TitleOrder } from '@mantine/core';

import AppLogoWhite from '../../assets/logo-white.svg';
import AppLogo from '../../assets/logo.svg';

type AppNameProps = {
	size?: 'sm' | 'md' | 'lg';
	variant?: 'full' | 'short';
};

export const AppName = ({ size = 'sm', variant = 'full' }: AppNameProps) => {
	let titleSize: TitleOrder;
	let logoSize;

	switch (size) {
		case 'sm':
			titleSize = 3;
			logoSize = 30;
			break;

		case 'md':
			titleSize = 3;
			logoSize = 30;
			break;

		case 'lg':
			titleSize = 1;
			logoSize = 44;
			break;
	}

	return (
		<Group gap={4}>
			<Image src={AppLogo} h={logoSize} w={logoSize} fit="contain" darkHidden />
			<Image src={AppLogoWhite} h={logoSize} w={logoSize} fit="contain" lightHidden />

			{variant === 'full' && (
				<Title order={titleSize} c="primary">
					Inboxt
				</Title>
			)}
		</Group>
	);
};
