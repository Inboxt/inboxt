import { Box, Divider, Flex } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { IconLetterCase, IconPaint, IconX } from '@tabler/icons-react';

import { ReaderSettingsPopover } from '../ReaderSettingsPopover';
import { AppViews } from '../../constants';
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
	const navigate = useNavigate({ from: Route.fullPath });
	const isBelowXsScreen = useScreenQuery('xs', 'below');

	return (
		<Flex direction={direction} gap={isBelowXsScreen ? 'xxxs' : 'sm'}>
			<Box visibleFrom="md">
				<ReaderSettingsPopover
					onClick={() =>
						void navigate({
							to: '/',
							search: { view: AppViews.INBOX },
						})
					}
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
							await navigate({ to: '/' });
						}}
					/>
				</>
			)}

			{variant === 'menu' && (
				<ItemsOptions
					items={[item]}
					mode="reader-menu"
					onActionComplete={async () => {
						await navigate({ to: '/' });
					}}
				/>
			)}
		</Flex>
	);
};
