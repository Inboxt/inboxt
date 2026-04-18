import { Box, Divider, Flex } from '@mantine/core';
import { IconLetterCase, IconPaint, IconX } from '@tabler/icons-react';
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { useContentSelection } from '~context/content-selection';
import { FormReadingSettings } from '~forms/FormReadingSettings';
import { FormReadingThemeSettings } from '~forms/FormReadingThemeSettings';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { SavedItem } from '~lib/graphql';
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
	const { visibleItems } = useContentSelection();
	const nextItemRef = useRef<string | null>(null);

	useEffect(() => {
		const currentIndex = visibleItems.findIndex((i) => {
			if (i.__typename === 'SavedItem') {
				return i.id === item?.id;
			}

			if (i.__typename === 'Highlight') {
				return i.savedItem?.id === item?.id;
			}

			return false;
		});

		const nextItem = visibleItems[currentIndex + 1];

		if (!nextItem) {
			nextItemRef.current = null;
			return;
		}

		if (nextItem.__typename === 'SavedItem') {
			nextItemRef.current = nextItem.id;
		} else if (nextItem.__typename === 'Highlight') {
			nextItemRef.current = nextItem.savedItem?.id ?? null;
		}
	}, [visibleItems, item?.id]);

	const handleActionComplete = async () => {
		if (nextItemRef.current && nextItemRef.current !== item?.id) {
			await navigate({
				to: '/r/$id',
				params: { id: nextItemRef.current },
				replace: true,
			});
		} else {
			handleGoBack();
		}
	};

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
						color="var(--reader-border-color)"
						orientation={direction === 'column' ? 'horizontal' : 'vertical'}
					/>

					<ItemsOptions
						items={[item]}
						mode="reader"
						onActionComplete={handleActionComplete}
					/>
				</>
			)}

			{variant === 'menu' && (
				<ItemsOptions
					items={[item]}
					mode="reader-menu"
					onActionComplete={handleActionComplete}
				/>
			)}
		</Flex>
	);
};
