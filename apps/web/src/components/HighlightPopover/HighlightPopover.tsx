import { Popover, Box, Button } from '@mantine/core';
import { ReactNode, CSSProperties } from 'react';

import classes from './HighlightPopover.module.css';

type HighlightPopoverProps = {
	visible: boolean;
	rect: DOMRect | null;
	buttonLabel: string;
	buttonIcon?: ReactNode;
	onButtonClick: () => void;
};

export const HighlightPopover = ({
	visible,
	rect,
	buttonLabel,
	buttonIcon,
	onButtonClick,
}: HighlightPopoverProps) => {
	if (!visible || !rect) {
		return null;
	}

	const dropdownStyle: CSSProperties = {
		left: rect.left + window.scrollX + rect.width / 2,
		transform: 'translateX(-50%)',
	};

	const boxStyle: CSSProperties = {
		top: rect.top + window.scrollY,
		left: rect.left + window.scrollX + rect.width / 2,
		transform: 'translateX(-50%)',
	};

	return (
		<Popover
			opened
			withArrow
			position="top"
			withinPortal
			styles={{ dropdown: dropdownStyle }}
			classNames={{
				arrow: classes.popoverArrow,
				dropdown: classes.popoverDropdown,
			}}
			arrowSize={12}
			radius="md"
		>
			<Popover.Target>
				<Box style={boxStyle} className={classes.popoverContent} />
			</Popover.Target>
			<Popover.Dropdown data-highlight-popover>
				<Button
					variant="transparent"
					color="white"
					size="compact-sm"
					leftSection={buttonIcon}
					onClick={onButtonClick}
				>
					{buttonLabel}
				</Button>
			</Popover.Dropdown>
		</Popover>
	);
};
