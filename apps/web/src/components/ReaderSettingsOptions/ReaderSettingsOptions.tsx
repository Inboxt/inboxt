import { Box, Divider, Flex } from '@mantine/core';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { IconLetterCase, IconPaint, IconX } from '@tabler/icons-react';

import { ReaderSettingsPopover } from '../ReaderSettingsPopover';
import { FormReadingSettings } from '../../forms/FormReadingSettings';
import { FormReadingThemeSettings } from '../../forms/FormReadingThemeSettings';
import { Route } from '../../routes/r.$id.tsx';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { ItemsOptions } from '../ItemsOptions';

type ReaderSettingsOptionsProps = {
	item: Record<string, unknown>;
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

	const handleGoBack = async () => {
		if (canGoBack) {
			void router.history.back();
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

					<ItemsOptions
						items={[item]}
						mode="reader"
						onActionComplete={async () => {
							await handleGoBack();
						}}
					/>
				</>
			)}

			{variant === 'menu' && (
				<ItemsOptions
					items={[item]}
					mode="reader-menu"
					onActionComplete={async () => {
						await handleGoBack();
					}}
				/>
			)}
		</Flex>
	);
};
