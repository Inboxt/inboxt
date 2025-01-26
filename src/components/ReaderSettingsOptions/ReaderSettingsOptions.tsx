import { ReaderSettingsPopover } from '../ReaderSettingsPopover';
import { AppViews } from '../../constants';
import {
	IconArchive,
	IconDots,
	IconLetterCase,
	IconPaint,
	IconTag,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { FormReadingSettings } from '../../forms/FormReadingSettings/FormReadingSettings.tsx';
import { FormReadingThemeSettings } from '../../forms/FormReadingThemeSettings';
import { ActionIcon, Divider, Flex } from '@mantine/core';
import { modals } from '@modals/modals.ts';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '../../routes/$id.tsx';
import { MenuDrawer } from '../MenuDrawer';

type ReaderSettingsOptionsProps = {
	direction?: 'column' | 'row';
	variant?: 'full' | 'menu';
};

export const ReaderSettingsOptions = ({
	direction = 'column',
	variant = 'full',
}: ReaderSettingsOptionsProps) => {
	const navigate = useNavigate({ from: Route.fullPath });

	const READER_EXTRA_OPTIONS = [
		{
			icon: <IconTag />,
			label: 'Edit labels',
			action: modals.openLabelsSelectionModal,
		},
		{
			icon: <IconArchive />,
			label: 'Move to archive',
			action: () => console.log('todo'),
		},
		{
			icon: <IconTrash />,
			label: 'Move to trash',
			action: () => console.log('todo'),
		},
	];

	return (
		<Flex direction={direction} gap="xxxs">
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

			<ReaderSettingsPopover
				label="Text and layout"
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
						orientation={
							direction === 'column' ? 'horizontal' : 'vertical'
						}
					/>

					{READER_EXTRA_OPTIONS.map((option) => (
						<ReaderSettingsPopover
							label={option.label}
							icon={option.icon}
							onClick={option.action}
						/>
					))}
				</>
			)}

			{variant === 'menu' && (
				<MenuDrawer
					items={READER_EXTRA_OPTIONS}
					label="More options"
					height={230}
				>
					<ActionIcon variant="subtle" color="text" size="lg">
						<IconDots />
					</ActionIcon>
				</MenuDrawer>
			)}
		</Flex>
	);
};
