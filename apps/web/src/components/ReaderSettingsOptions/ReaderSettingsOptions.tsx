import { Box, Divider, Flex } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconLetterCase, IconPaint, IconX } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import { FormReadingSettings } from '~forms/FormReadingSettings';
import { FormReadingThemeSettings } from '~forms/FormReadingThemeSettings';
import { useAdjacentItems } from '~hooks/useAdjacentItems';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { SavedItem } from '~lib/graphql';

import { ItemsOptions } from '../ItemsOptions';
import { ReaderSettingsPopover } from '../ReaderSettingsPopover';

type ReaderSettingsOptionsProps = {
	item: SavedItem | null;
	direction?: 'column' | 'row';
	showAllOptions?: boolean;
	loading?: boolean;
	onLoadingChange?: (loading: boolean) => void;
	onActionComplete?: () => void | Promise<void>;
};

export const ReaderSettingsOptions = ({
	item,
	direction = 'column',
	showAllOptions = false,
	loading: externalLoading,
	onLoadingChange,
	onActionComplete: externalOnActionComplete,
}: ReaderSettingsOptionsProps) => {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const navigate = useNavigate();
	const isBelowXsScreen = useScreenQuery('xs', 'below');
	const { nextId, prevId } = useAdjacentItems(item?.id);
	const [internalLoading, setInternalLoading] = useState(false);

	const isActionsLoading = externalLoading ?? internalLoading;

	const handleLoadingChange = (loading: boolean) => {
		setInternalLoading(loading);
		onLoadingChange?.(loading);
	};

	const handleNavigate = (id: string | null) => {
		if (!id) {
			return;
		}

		void navigate({
			to: '/r/$id',
			params: { id },
			search: (prev) => prev,
			replace: true,
		});
	};

	const handleActionComplete = async () => {
		if (externalOnActionComplete) {
			await externalOnActionComplete();
			return;
		}

		if (nextId) {
			await navigate({
				to: '/r/$id',
				params: { id: nextId },
				search: (prev) => prev,
				replace: true,
			});
		} else {
			await handleGoBack();
		}
	};

	const handleGoBack = async () => {
		if (canGoBack) {
			router.history.back();
		} else {
			await navigate({
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
					disabled={isActionsLoading}
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

			{showAllOptions && (
				<>
					<Divider
						color="var(--reader-border-color)"
						orientation={direction === 'column' ? 'horizontal' : 'vertical'}
					/>

					<ReaderSettingsPopover
						onClick={() => handleNavigate(prevId)}
						label="Previous article"
						icon={<IconArrowUp />}
						disabled={!prevId || isActionsLoading}
					/>

					<ReaderSettingsPopover
						onClick={() => handleNavigate(nextId)}
						label="Next article"
						icon={<IconArrowDown />}
						disabled={!nextId || isActionsLoading}
					/>

					<Divider
						color="var(--reader-border-color)"
						orientation={direction === 'column' ? 'horizontal' : 'vertical'}
					/>

					<ItemsOptions
						items={[item]}
						mode="reader"
						onActionComplete={handleActionComplete}
						onLoadingChange={handleLoadingChange}
					/>
				</>
			)}
		</Flex>
	);
};
