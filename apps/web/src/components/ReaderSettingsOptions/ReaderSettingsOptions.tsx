import { Box, Divider, Flex } from '@mantine/core';
import { IconLetterCase, IconPaint, IconX } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';

import { FormReadingSettings } from '~forms/FormReadingSettings';
import { FormReadingThemeSettings } from '~forms/FormReadingThemeSettings';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { SavedItem } from '~lib/graphql/generated/graphql';
import { Route } from '~routes/r.$id';

import { ItemsOptions } from '../ItemsOptions';
import { ReaderSettingsPopover } from '../ReaderSettingsPopover';

type ReaderSettingsOptionsProps = {
	item: SavedItem | null;
	direction?: 'column' | 'row';
	variant?: 'full' | 'menu';
};

export const ReaderSettingsOptions = ({
	item,
	direction = 'column',
	variant = 'full',
}: ReaderSettingsOptionsProps) => {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const navigate = useNavigate({ from: Route.fullPath });
	const isBelowXsScreen = useScreenQuery('xs', 'below');

	const handleGoBack = () => {
		if (canGoBack) {
			router.history.back();
		} else {
			void navigate({
				to: '/',
			});
		}
	};

	if (!item) {
		return null;
	}

	return (
		<Flex direction={direction} gap={isBelowXsScreen ? 'xxxs' : 'sm'}>
			<Box visibleFrom="md">
				<ReaderSettingsPopover
					onClick={handleGoBack}
					label="Close reader view"
					icon={<IconX />}
				/>
			</Box>

			<ReaderSettingsPopover
				label={isBelowXsScreen ? 'Text' : 'Text and layout'}
				icon={<IconLetterCase />}
			>
				<FormReadingSettings />
			</ReaderSettingsPopover>

			<ReaderSettingsPopover label="Theme" icon={<IconPaint />}>
				<FormReadingThemeSettings />
			</ReaderSettingsPopover>

			{variant === 'full' && (
				<>
					<Divider
						color="black"
						orientation={direction === 'column' ? 'horizontal' : 'vertical'}
					/>

					<ItemsOptions items={[item]} mode="reader" onActionComplete={handleGoBack} />
				</>
			)}

			{variant === 'menu' && (
				<ItemsOptions items={[item]} mode="reader-menu" onActionComplete={handleGoBack} />
			)}
		</Flex>
	);
};
