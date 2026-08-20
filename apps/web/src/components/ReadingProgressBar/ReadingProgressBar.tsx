import { Progress } from '@mantine/core';
import { clsx } from 'clsx';
import { CSSProperties } from 'react';

import classes from './ReadingProgressBar.module.css';

interface ReadingProgressBarProps {
	progress: number;
	className?: string;
	style?: CSSProperties;
}

export const ReadingProgressBar = ({ progress, className, style }: ReadingProgressBarProps) => {
	return (
		<Progress
			value={progress * 100}
			size={2}
			radius={0}
			className={clsx(classes.progressBar, className)}
			color="var(--mantine-primary-color-filled)"
			style={{
				backgroundColor: 'var(--reader-border-color)',
				...style,
			}}
		/>
	);
};
