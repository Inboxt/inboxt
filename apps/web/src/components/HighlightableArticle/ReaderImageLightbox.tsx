import { Box, Image, Overlay, Text } from '@mantine/core';
import { useEffect } from 'react';

export type ReaderLightboxImage = {
	src: string;
	alt: string;
	naturalWidth: number;
	naturalHeight: number;
};

type ReaderImageLightboxProps = {
	image: ReaderLightboxImage | null;
	onClose: () => void;
};

export const ReaderImageLightbox = ({ image, onClose }: ReaderImageLightboxProps) => {
	useEffect(() => {
		if (!image) {
			return;
		}

		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleEsc);

		return () => {
			window.removeEventListener('keydown', handleEsc);
		};
	}, [image, onClose]);

	if (!image) {
		return null;
	}

	return (
		<Box
			onClick={onClose}
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 1000,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 'var(--mantine-spacing-xs)',
			}}
		>
			<Overlay color="#000" backgroundOpacity={0.7} zIndex={0} onClick={onClose} />
			<Box
				onClick={(event) => event.stopPropagation()}
				style={{
					position: 'relative',
					zIndex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 'var(--mantine-spacing-sm)',
					maxWidth: '98vw',
				}}
			>
				<Image
					src={image.src}
					alt={image.alt}
					fit="contain"
					style={{
						touchAction: 'pinch-zoom',
						maxWidth:
							image.naturalWidth > 0 ? `min(96vw, ${image.naturalWidth}px)` : '96vw',
						maxHeight:
							image.naturalHeight > 0
								? `min(90vh, ${image.naturalHeight}px)`
								: '90vh',
					}}
				/>
				<Text c="gray.2" size="sm" ta="center">
					Tap outside the image or press Esc to close
				</Text>
			</Box>
		</Box>
	);
};
